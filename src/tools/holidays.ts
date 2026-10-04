import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const holidaysTools: ToolDefinition[] = [
  {
    name: "Holidays: List_holidays",
    description: "List all configured holidays.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/holidays", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Holidays: Get_holiday",
    description: "Retrieve a single holiday by id.",
    inputSchema: {
      type: "object",
      properties: { holidayId: idProperty("The Brivo holiday id, e.g. from Holidays: List_holidays.") },
      required: ["holidayId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/holidays/${args.holidayId}`),
  },
];
