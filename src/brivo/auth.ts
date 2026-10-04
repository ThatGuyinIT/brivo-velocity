import { createServer } from "node:http";
import { exec } from "node:child_process";
import { writeLog } from "../logger.js";

// Never log a credential/token value in full - a dev-mode log file is still a file on disk.
function redact(value: string | undefined): string {
  if (!value) return "(none)";
  return value.length <= 8 ? "***" : `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export interface BrivoTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

export interface BrivoUrls {
  authBase: string;
  apiBase: string;
}

// apiBase includes /v1/api - per brivo-access-api-context.yaml's baseUrl and the proxy
// example in brivo-access-llms.txt (/api/v1/api/sites -> https://api.brivo.com/v1/api/sites).
// api-overview.md's own "Base URLs" table only lists the bare host, which is right for
// auth.brivo.com but would 404 every data call if used as-is for api.brivo.com.
export function getBrivoUrls(environment: string | undefined): BrivoUrls {
  if ((environment ?? "prod").toLowerCase() === "eu") {
    return { authBase: "https://auth.eu.brivo.com", apiBase: "https://api.eu.brivo.com/v1/api" };
  }
  return { authBase: "https://auth.brivo.com", apiBase: "https://api.brivo.com/v1/api" };
}

function basicAuthHeader(clientId: string, clientSecret: string): string {
  return "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

interface TokenRequestParams {
  authBase: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  body: Record<string, string>;
}

async function requestToken(params: TokenRequestParams): Promise<BrivoTokens> {
  const url = `${params.authBase}/oauth/token`;
  const grantType = params.body.grant_type;
  writeLog(`Brivo API call: POST ${url} (grant_type=${grantType})`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(params.clientId, params.clientSecret),
      "api-key": params.apiKey,
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params.body).toString(),
  });

  const json = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !json.access_token || !json.refresh_token) {
    writeLog(
      `Brivo API response: POST ${url} (grant_type=${grantType}) -> ${response.status} FAILED - ` +
        `${json.error_description ?? json.error ?? "unknown error"}`,
    );
    throw new Error(
      `Brivo token request failed (${response.status}): ${json.error_description ?? json.error ?? "unknown error"}`,
    );
  }

  writeLog(
    `Brivo API response: POST ${url} (grant_type=${grantType}) -> ${response.status} OK - ` +
      `access_token=${redact(json.access_token)}, refresh_token=${redact(json.refresh_token)}, expires_in=${json.expires_in ?? 300}s`,
  );

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + (json.expires_in ?? 300) * 1000,
  };
}

export async function passwordGrant(opts: {
  authBase: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}): Promise<BrivoTokens> {
  return requestToken({
    authBase: opts.authBase,
    apiKey: opts.apiKey,
    clientId: opts.clientId,
    clientSecret: opts.clientSecret,
    body: { grant_type: "password", username: opts.username, password: opts.password },
  });
}

export async function refreshGrant(opts: {
  authBase: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<BrivoTokens> {
  return requestToken({
    authBase: opts.authBase,
    apiKey: opts.apiKey,
    clientId: opts.clientId,
    clientSecret: opts.clientSecret,
    body: { grant_type: "refresh_token", refresh_token: opts.refreshToken },
  });
}

// 3-legged: opens the system browser to Brivo's hosted login, and runs a short-lived local
// HTTP server on the registered redirect URI to catch the `?code=` callback.
//
// OPEN QUESTION (see ToDo.md): api-overview.md lists Authorization/api-key headers on the
// GET /oauth/authorize step, but a plain browser redirect can't attach custom headers. This
// implements the standard 3-legged convention (browser navigates with query params only,
// no headers) since that's the only thing an actual browser redirect can do - unverified
// against a real registered 3-Legged Application, since none exists yet to test against.
export async function authorizationCodeGrant(opts: {
  authBase: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<BrivoTokens> {
  const code = await captureAuthorizationCode(opts.authBase, opts.clientId, opts.redirectUri);
  return requestToken({
    authBase: opts.authBase,
    apiKey: opts.apiKey,
    clientId: opts.clientId,
    clientSecret: opts.clientSecret,
    body: { grant_type: "authorization_code", code, redirect_uri: opts.redirectUri },
  });
}

function captureAuthorizationCode(authBase: string, clientId: string, redirectUri: string): Promise<string> {
  const redirect = new URL(redirectUri);
  const port = redirect.port ? Number(redirect.port) : 80;

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const requestUrl = new URL(req.url ?? "/", redirectUri);
      if (requestUrl.pathname !== redirect.pathname) {
        res.writeHead(404).end();
        return;
      }

      const code = requestUrl.searchParams.get("code");
      const error = requestUrl.searchParams.get("error");

      writeLog(
        `Brivo authorization_code callback: GET ${requestUrl.pathname} -> ` +
          (error ? `error=${error}` : code ? `code=${redact(code)}` : "no code or error parameter"),
      );

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        error
          ? `<h1>Brivo login failed</h1><p>${error}</p><p>You can close this window.</p>`
          : `<h1>Brivo login complete</h1><p>You can close this window and return to Claude.</p>`,
      );
      res.req.socket.end();
      server.close();

      if (error) {
        reject(new Error(`Brivo authorization failed: ${error}`));
      } else if (code) {
        resolve(code);
      } else {
        reject(new Error("Brivo redirect did not include a code or error parameter."));
      }
    });

    server.on("error", (err) => {
      writeLog(`Brivo authorization_code local server error: ${(err as Error).message}`);
      reject(err);
    });

    server.listen(port, redirect.hostname, () => {
      const authorizeUrl = new URL(`${authBase}/oauth/authorize`);
      authorizeUrl.searchParams.set("response_type", "code");
      authorizeUrl.searchParams.set("client_id", clientId);
      writeLog(`Brivo API call: GET ${authorizeUrl.toString()} (opening system browser)`);
      openInBrowser(authorizeUrl.toString());
    });
  });
}

function openInBrowser(url: string): void {
  if (process.platform === "darwin") {
    exec(`open "${url}"`);
    return;
  }
  if (process.platform === "win32") {
    // `start` is a cmd.exe builtin; the empty "" is its (required) window-title argument.
    exec(`cmd /c start "" "${url}"`);
    return;
  }
  throw new Error(`Unsupported platform for opening a browser: ${process.platform}`);
}
