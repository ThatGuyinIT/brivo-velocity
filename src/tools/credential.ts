import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const credentialTools: ToolDefinition[] = [
  {
    name: "Credential: List_credentials",
    description: "List all Brivo credentials.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/credentials", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Credential: List_credential_formats",
    description: "List the credential formats available on this account.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/credentials/formats"),
  },
  {
    name: "Credential: Get_credential",
    description: "Retrieve a single Brivo credential by id.",
    inputSchema: {
      type: "object",
      properties: { credentialId: idProperty("The Brivo credential id, e.g. from Credential: List_credentials.") },
      required: ["credentialId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/credentials/${args.credentialId}`),
  },
  {
    name: "Credential: Get_user_by_credential",
    description: "Retrieve the user a credential is assigned to.",
    inputSchema: {
      type: "object",
      properties: { credentialId: idProperty("The Brivo credential id.") },
      required: ["credentialId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/credentials/${args.credentialId}/user`),
  },
];
