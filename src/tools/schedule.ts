import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const scheduleTools: ToolDefinition[] = [
  {
    name: "Schedule: List_schedules",
    description: "List all Brivo schedules.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/schedules", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Schedule: Get_schedule",
    description: "Retrieve a single Brivo schedule by id.",
    inputSchema: {
      type: "object",
      properties: { scheduleId: idProperty("The Brivo schedule id, e.g. from Schedule: List_schedules.") },
      required: ["scheduleId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/schedules/${args.scheduleId}`),
  },
];
