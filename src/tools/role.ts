import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const roleTools: ToolDefinition[] = [
  {
    name: "Role: List_roles",
    description: "List all Brivo administrator roles.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/roles"),
  },
];
