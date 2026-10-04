import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const passTools: ToolDefinition[] = [
  {
    name: "Pass: Get_mobile_pass",
    description: "Get the current user's Brivo mobile pass.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/pass"),
  },
];
