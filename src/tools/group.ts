import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const groupTools: ToolDefinition[] = [
  {
    name: "Group: List_groups",
    description: "List all Brivo access groups.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/groups", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Group: Get_group",
    description: "Retrieve a single Brivo access group by id.",
    inputSchema: {
      type: "object",
      properties: { groupId: idProperty("The Brivo group id, e.g. from Group: List_groups.") },
      required: ["groupId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/groups/${args.groupId}`),
  },
  {
    name: "Group: List_group_access_point_permissions",
    description: "List the access points a group has permission on.",
    inputSchema: {
      type: "object",
      properties: {
        groupId: idProperty("The Brivo group id."),
        offset: offsetProperty,
        pageSize: pageSizeProperty,
        filter: filterProperty,
      },
      required: ["groupId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, `/groups/${args.groupId}/access/access-points`, {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Group: List_group_users",
    description: "List the users belonging to a group.",
    inputSchema: {
      type: "object",
      properties: {
        groupId: idProperty("The Brivo group id."),
        offset: offsetProperty,
        pageSize: pageSizeProperty,
      },
      required: ["groupId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, `/groups/${args.groupId}/users`, {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
      }),
  },
];
