import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const activityTools: ToolDefinition[] = [
  {
    name: "Activity: List_activities",
    description: "List account activity entries.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/activities", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
];
