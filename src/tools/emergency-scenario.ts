import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const emergencyScenarioTools: ToolDefinition[] = [
  {
    name: "Emergency Scenario: List_emergency_scenarios",
    description: "List all configured emergency scenarios (lockdown/egress).",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/emergency-scenarios", { offset: args.offset as number, pageSize: args.pageSize as number }),
  },
  {
    name: "Emergency Scenario: List_active_emergency_scenarios",
    description: "List emergency scenarios currently active.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/emergency-scenarios/active-scenarios", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
      }),
  },
];
