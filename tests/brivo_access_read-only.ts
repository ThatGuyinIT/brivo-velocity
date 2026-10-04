// Exercises every registered MCP tool (src/tools/index.ts -> allTools) against a real
// account, end to end - the same handler functions the MCP server itself calls, not a
// separately-maintained list of endpoints, so a new tool is automatically covered here
// too (or loudly flagged as un-sourceable - see ID_SOURCE_TOOL below) without needing this
// script edited by hand to match.
//
// Run after `npm run build` (imports the compiled output, not src/ directly - see ToDo.md
// for why a plain `node tests/*.ts` can't resolve `../src/foo.js` specifiers to `foo.ts`):
//   node tests/brivo_access_read-only.ts [path-to-brivo-velocity.env]
//
// No hardcoded personal path - defaults to brivo-velocity.env in whatever folder this
// script is actually run from (same convention as src/config.ts's getAppDir()), so it finds
// a real deployed env file for free if copied next to one (e.g. into claude-mcp-servers,
// where brivo-velocity.exe and its brivo-velocity.env already live) and run from there. The
// CLI arg above still overrides this for any other location.
import { dirname, join } from "node:path";
import dotenv from "dotenv";
import { BrivoSession, credentialsFromEnv } from "../dist/brivo/session.js";
import { allTools, type ToolDefinition } from "../dist/tools/index.js";

const DEFAULT_ENV_PATH = join(dirname(process.argv[1] ?? "."), "brivo-velocity.env");

// Maps a required id-parameter name to the zero-argument tool whose first result supplies
// it. A tool needing some other required argument (an id with no clean zero-arg source here,
// or a non-id parameter like Camera's startTime/endTime) gets skipped with a clear reason
// (see "unknown"/"missing" below) rather than silently guessed at.
const ID_SOURCE_TOOL: Record<string, string> = {
  siteId: "Site: List_sites",
  accessPointId: "Access Point: List_access_points",
  controlPanelId: "Control Panel: List_control_panels",
  accountId: "Account: List_accounts",
  administratorId: "Administrator: List_administrators",
  applicationId: "Application: List_applications",
  cameraId: "Camera: List_cameras",
  credentialId: "Credential: List_credentials",
  eventSubscriptionId: "Event Subscription: List_event_subscriptions",
  groupId: "Group: List_groups",
  holidayId: "Holidays: List_holidays",
  scheduleId: "Schedule: List_schedules",
  userId: "User: List_users",
};

interface Result {
  name: string;
  ok: boolean;
  args: string;
  note: string;
}

const results: Result[] = [];
const ids: Record<string, string | number> = {};

function firstId(response: unknown): string | number | undefined {
  return (response as { data?: Array<{ id?: string | number }> } | undefined)?.data?.[0]?.id;
}

async function run(session: BrivoSession, tool: ToolDefinition, args: Record<string, unknown>): Promise<unknown> {
  try {
    const response = await tool.handler(session, args);
    const data = (response as { data?: unknown[] } | undefined)?.data;
    results.push({ name: tool.name, ok: true, args: JSON.stringify(args), note: Array.isArray(data) ? `${data.length} record(s)` : "OK" });
    return response;
  } catch (err) {
    results.push({ name: tool.name, ok: false, args: JSON.stringify(args), note: (err as Error).message });
    return undefined;
  }
}

function skip(tool: ToolDefinition, reason: string): void {
  results.push({ name: tool.name, ok: false, args: "-", note: `SKIPPED - ${reason}` });
}

async function main(): Promise<void> {
  const envPath = process.argv[2] ?? DEFAULT_ENV_PATH;
  dotenv.config({ path: envPath });

  const session = new BrivoSession(dirname(envPath), credentialsFromEnv(process.env));

  // Pass 1: tools with no required arguments. Also where ID_SOURCE_TOOL's ids come from.
  const zeroArgTools = allTools.filter((t) => !t.inputSchema.required?.length);
  for (const tool of zeroArgTools) {
    const response = await run(session, tool, {});
    const id = firstId(response);
    if (id === undefined) continue;
    for (const [paramName, sourceToolName] of Object.entries(ID_SOURCE_TOOL)) {
      if (sourceToolName === tool.name) ids[paramName] = id;
    }
  }

  // Pass 2: tools requiring id argument(s), sourced from pass 1's results.
  const idArgTools = allTools.filter((t) => (t.inputSchema.required?.length ?? 0) > 0);
  for (const tool of idArgTools) {
    const required = tool.inputSchema.required ?? [];

    const unknownParams = required.filter((p) => !(p in ID_SOURCE_TOOL));
    if (unknownParams.length > 0) {
      skip(tool, `don't know how to source required argument(s): ${unknownParams.join(", ")} - update ID_SOURCE_TOOL`);
      continue;
    }

    const missing = required.filter((p) => ids[p] === undefined);
    if (missing.length > 0) {
      skip(tool, `no ${missing.join(", ")} available (its source list came back empty)`);
      continue;
    }

    await run(session, tool, Object.fromEntries(required.map((p) => [p, ids[p]])));
  }

  // Safety net: the two passes above partition allTools by whether it has required args,
  // so this should always be empty - but if it's ever not, that's a tool silently skipped
  // by construction, which is exactly what this script exists to catch.
  const untested = allTools.filter((t) => !results.some((r) => r.name === t.name));
  for (const tool of untested) {
    results.push({ name: tool.name, ok: false, args: "-", note: "NOT EXERCISED - fell through both passes" });
  }

  // --- Summary ---
  const width = Math.max(...results.map((r) => r.name.length));
  console.log(`\n${results.filter((r) => r.ok).length}/${allTools.length} tools succeeded\n`);
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.args.padEnd(30)}  ${r.note}`);
  }

  if (results.some((r) => !r.ok)) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
