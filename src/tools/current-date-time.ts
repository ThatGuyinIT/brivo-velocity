import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const currentDateTimeTools: ToolDefinition[] = [
  {
    name: "Current Date Time: Get_current_time",
    description: "Get the Brivo server's current date and time.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    // Live server requires a `current-date` header (ISO instant) that the OpenAPI spec
    // never documents (confirmed by testing: 400 "Required request header 'current-date'
    // for method parameter type Instant is not present" with no header sent at all).
    handler: (session) => brivoGet(session, "/time", undefined, { "current-date": new Date().toISOString() }),
  },
];
