import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const featuresTools: ToolDefinition[] = [
  {
    name: "Features: Get_features",
    description: "Get the features enabled on this Brivo account.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/features"),
  },
];
