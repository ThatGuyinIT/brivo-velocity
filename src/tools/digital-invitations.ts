import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const digitalInvitationsTools: ToolDefinition[] = [
  {
    name: "Digital Invitations: List_user_digital_invitations",
    description: "List the digital invitations issued to a user.",
    inputSchema: {
      type: "object",
      properties: {
        userId: idProperty("The Brivo user id."),
        offset: offsetProperty,
        pageSize: pageSizeProperty,
        filter: filterProperty,
      },
      required: ["userId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, `/users/${args.userId}/credentials/digital-invitations`, {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
];
