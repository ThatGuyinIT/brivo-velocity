import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const administratorTools: ToolDefinition[] = [
  {
    name: "Administrator: List_administrators",
    description: "List all Brivo administrators.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/administrators", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Administrator: Get_current_administrator",
    description: "Retrieve the administrator this login belongs to.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/administrators/whoami"),
  },
  {
    name: "Administrator: Get_administrator",
    description: "Retrieve a single Brivo administrator by id.",
    inputSchema: {
      type: "object",
      properties: { administratorId: idProperty("The Brivo administrator id, e.g. from Administrator: List_administrators.") },
      required: ["administratorId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/administrators/${args.administratorId}`),
  },
  {
    name: "Administrator: Get_administrator_login",
    description: "Retrieve login details for an administrator.",
    inputSchema: {
      type: "object",
      properties: { administratorId: idProperty("The Brivo administrator id.") },
      required: ["administratorId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/administrators/${args.administratorId}/login`),
  },
  {
    name: "Administrator: List_administrator_roles",
    description: "List the roles assigned to an administrator.",
    inputSchema: {
      type: "object",
      properties: { administratorId: idProperty("The Brivo administrator id.") },
      required: ["administratorId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/administrators/${args.administratorId}/roles`),
  },
];
