import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const digitalCredentialsTools: ToolDefinition[] = [
  {
    name: "Digital Credentials: Get_allegion_credential_allotment",
    description: "Get the Allegion digital credential allotment for this account.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/credentials/digital/allegion-allotment"),
  },
  {
    name: "Digital Credentials: Get_credential_allotment",
    description: "Get the digital credential allotment for this account.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/credentials/digital/allotment"),
  },
  {
    name: "Digital Credentials: Get_user_digital_credential",
    description: "Retrieve the current user's digital credential.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session) => brivoGet(session, "/users/credentials/digital"),
  },
];
