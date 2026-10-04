import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, idProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const assignmentsTools: ToolDefinition[] = [
  {
    name: "Assignments: Get_admin_assignments",
    description: "Retrieve the site/group assignments configured for an administrator.",
    inputSchema: {
      type: "object",
      properties: { administratorId: idProperty("The Brivo administrator id.") },
      required: ["administratorId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/assignments/${args.administratorId}`),
  },
];
