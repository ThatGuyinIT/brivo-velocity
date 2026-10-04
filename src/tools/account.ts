import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const accountTools: ToolDefinition[] = [
  {
    name: "Account: List_accounts",
    description: "List all Brivo accounts.",
    inputSchema: {
      type: "object",
      properties: { filter: filterProperty, offset: offsetProperty, pageSize: pageSizeProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/accounts", {
        filter: args.filter as string,
        offset: args.offset as number,
        pageSize: args.pageSize as number,
      }),
  },
  {
    name: "Account: Get_account_summary",
    description: "Retrieve a summary of the current account.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/accounts/summary"),
  },
  {
    name: "Account: Get_account",
    description: "Retrieve a single Brivo account by id.",
    inputSchema: {
      type: "object",
      properties: { accountId: idProperty("The Brivo account id, e.g. from Account: List_accounts.") },
      required: ["accountId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/accounts/${args.accountId}`),
  },
  {
    name: "Account: List_account_administrators",
    description: "List the administrators for an account.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: idProperty("The Brivo account id."),
        offset: offsetProperty,
        pageSize: pageSizeProperty,
      },
      required: ["accountId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, `/accounts/${args.accountId}/administrators`, {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
      }),
  },
  {
    name: "Account: List_account_features",
    description: "List the enabled features for an account.",
    inputSchema: {
      type: "object",
      properties: { accountId: idProperty("The Brivo account id.") },
      required: ["accountId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/accounts/${args.accountId}/features`),
  },
  {
    name: "Account: List_account_settings",
    description: "List the settings for an account.",
    inputSchema: {
      type: "object",
      properties: { accountOid: idProperty("The Brivo account object id.") },
      required: ["accountOid"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/accounts/${args.accountOid}/settings`),
  },
];
