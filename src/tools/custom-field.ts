import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const customFieldTools: ToolDefinition[] = [
  {
    name: "Custom Field: List_custom_fields",
    description: "List all Brivo custom fields.",
    inputSchema: {
      // Brivo's own reference marks offset/pageSize as required for this specific endpoint
      // (unlike every other list endpoint, where they're optional) - honored as documented.
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty },
      required: ["offset", "pageSize"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/custom-fields", { offset: args.offset as number, pageSize: args.pageSize as number }),
  },
  {
    name: "Custom Field: Get_custom_field",
    description: "Retrieve a single Brivo custom field by id.",
    inputSchema: {
      type: "object",
      properties: { customFieldId: idProperty("The Brivo custom field id, e.g. from Custom Field: List_custom_fields.") },
      required: ["customFieldId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/custom-fields/${args.customFieldId}`),
  },
];
