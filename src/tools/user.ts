import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const userTools: ToolDefinition[] = [
  {
    name: "User: Get_batch_job_status",
    description: "Check the status of a batch job (e.g. a batch user/group assignment).",
    inputSchema: {
      type: "object",
      properties: { jobId: idProperty("The batch job id.") },
      required: ["jobId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/batch/${args.jobId}`),
  },
  {
    name: "User: List_users",
    description: "List all Brivo users.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/users", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "User: Get_user_by_external_id",
    description: "Retrieve a user by their external (third-party system) id.",
    inputSchema: {
      type: "object",
      properties: { externalId: idProperty("The user's external id.") },
      required: ["externalId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/users/${args.externalId}/external`),
  },
  {
    name: "User: List_user_custom_fields",
    description: "List the custom field values set on a user.",
    inputSchema: {
      type: "object",
      properties: { userId: idProperty("The Brivo user id, e.g. from User: List_users.") },
      required: ["userId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/users/${args.userId}/custom-fields`),
  },
  {
    name: "User: Get_user",
    description: "Retrieve a single Brivo user by id.",
    inputSchema: {
      type: "object",
      properties: { userId: idProperty("The Brivo user id.") },
      required: ["userId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/users/${args.userId}`),
  },
  {
    name: "User: List_user_credentials",
    description: "List the credentials assigned to a user.",
    inputSchema: {
      type: "object",
      properties: { userId: idProperty("The Brivo user id.") },
      required: ["userId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/users/${args.userId}/credentials`),
  },
  {
    name: "User: List_user_groups",
    description: "List the groups a user belongs to.",
    inputSchema: {
      type: "object",
      properties: { userId: idProperty("The Brivo user id.") },
      required: ["userId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/users/${args.userId}/groups`),
  },
  {
    name: "User: Get_user_photo",
    description: "Get a user's photo. Brivo doesn't document this response's content-type - if it comes back as a non-JSON (likely image) response, this reports its content-type and size rather than the raw bytes.",
    inputSchema: {
      type: "object",
      properties: { userId: idProperty("The Brivo user id.") },
      required: ["userId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/users/${args.userId}/photo`),
  },
  {
    name: "User: Get_user_suspended_status",
    description: "Check whether a user is suspended.",
    inputSchema: {
      type: "object",
      properties: { userId: idProperty("The Brivo user id.") },
      required: ["userId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/users/${args.userId}/suspended`),
  },
];
