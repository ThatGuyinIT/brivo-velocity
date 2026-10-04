import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const applicationTools: ToolDefinition[] = [
  {
    name: "Application: List_applications",
    description: "List all Brivo API applications.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/applications", { offset: args.offset as number, pageSize: args.pageSize as number }),
  },
  {
    name: "Application: List_authorized_applications",
    description: "List applications authorized on this account.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/applications/authorized"),
  },
  {
    name: "Application: Get_application",
    description: "Retrieve a single Brivo application by id.",
    inputSchema: {
      type: "object",
      properties: { applicationId: idProperty("The Brivo application id, e.g. from Application: List_applications.") },
      required: ["applicationId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/applications/${args.applicationId}`),
  },
];
