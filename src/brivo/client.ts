import type { BrivoSession } from "./session.js";
import { writeLog } from "../logger.js";

export class BrivoApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    message: string,
  ) {
    super(message);
  }
}

export type BrivoQuery = Record<string, string | number | boolean | undefined>;

// Marker shape brivoGet() returns for an image/* response, so src/index.ts's CallTool
// handler can tell "this is an image, emit an MCP image content block" generically -
// not special-cased to any one tool/endpoint, since any GET could turn out to return one.
export interface BrivoImageResult {
  __brivoImage: true;
  mimeType: string;
  data: string; // base64
  byteLength: number;
}

export function isBrivoImageResult(value: unknown): value is BrivoImageResult {
  return typeof value === "object" && value !== null && (value as { __brivoImage?: unknown }).__brivoImage === true;
}

// Brivo's declared Content-Type for image responses isn't trustworthy (confirmed: a photo
// came back labeled "image/jpeg" while its bytes were PNG-signed - likely a static header
// regardless of what format the user actually uploaded, not a one-off bug) - sniff the real
// format from the magic bytes instead of trusting the header. Falls back to the declared
// header only if the bytes don't match any known signature.
function sniffImageMimeType(buffer: ArrayBuffer, declaredContentType: string): string {
  const bytes = new Uint8Array(buffer, 0, Math.min(12, buffer.byteLength));
  const matches = (...signature: number[]) => signature.every((b, i) => bytes[i] === b);

  if (matches(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (matches(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (matches(0x47, 0x49, 0x46, 0x38)) return "image/gif";
  if (matches(0x42, 0x4d)) return "image/bmp";
  if (
    matches(0x52, 0x49, 0x46, 0x46) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return declaredContentType;
}

function appendQuery(path: string, query?: BrivoQuery): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

// Generic authenticated GET against api.brivo.com (session.apiBase already includes
// /v1/api - see getBrivoUrls()). Shared low-level call used by every read-only tool.
// `extraHeaders` exists for the rare endpoint whose live server requires something the
// OpenAPI spec never documents (see Current_Date_Time's `current-date` header).
export async function brivoGet<T = unknown>(
  session: BrivoSession,
  path: string,
  query?: BrivoQuery,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const [accessToken, apiKey] = [await session.getAccessToken(), session.apiKey];
  const url = `${session.apiBase}${appendQuery(path, query)}`;

  writeLog(`Brivo API call: GET ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "api-key": apiKey,
      "Content-type": "application/json",
      ...extraHeaders,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    writeLog(`Brivo API response: GET ${url} -> ${response.status} FAILED - ${text.slice(0, 300)}`);
    throw new BrivoApiError(response.status, path, `Brivo API call failed (${response.status}): ${text.slice(0, 300)}`);
  }

  // A few endpoints (e.g. user photo) don't document their success response's content-type
  // at all - rather than assume JSON and crash on a parse error, check for real before parsing.
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    const buffer = await response.arrayBuffer();
    writeLog(`Brivo API response: GET ${url} -> ${response.status} OK (non-JSON: ${contentType || "unknown"}, ${buffer.byteLength} bytes)`);

    if (contentType.startsWith("image/")) {
      const mimeType = sniffImageMimeType(buffer, contentType);
      if (mimeType !== contentType) {
        writeLog(`Brivo API response: GET ${url} - declared Content-Type "${contentType}" but bytes are ${mimeType} - using the sniffed type.`);
      }
      return {
        __brivoImage: true,
        mimeType,
        data: Buffer.from(buffer).toString("base64"),
        byteLength: buffer.byteLength,
      } satisfies BrivoImageResult as T;
    }

    return {
      contentType: contentType || "unknown",
      byteLength: buffer.byteLength,
      note: "Non-JSON, non-image response - binary content is not returned as text. Use contentType/byteLength to confirm what came back.",
    } as T;
  }

  const text = await response.text();
  writeLog(`Brivo API response: GET ${url} -> ${response.status} OK`);
  return (text ? JSON.parse(text) : undefined) as T;
}
