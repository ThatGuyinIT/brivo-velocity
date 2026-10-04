import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, pageSizeProperty, stringProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

// Note: occurred/processed filters can't be combined (Brivo's own constraint - see each
// endpoint's `filter` field for the exact available filter criteria).
const eventOffsetProperty = stringProperty(
  "Resume from this offset - use the minimum 'occurred' value from the last page read, not a plain integer index.",
);

export const eventsTools: ToolDefinition[] = [
  {
    name: "Events: List_access_events",
    description: "List access events (door opens, denied attempts, etc.).",
    inputSchema: {
      type: "object",
      properties: { offset: eventOffsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/events/access", {
        offset: args.offset as string,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Events: List_audit_events",
    description: "List audit events (administrative changes).",
    inputSchema: {
      type: "object",
      properties: { offset: eventOffsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/events/audit", {
        offset: args.offset as string,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Events: Count_access_events",
    description: "Count access events matching a filter.",
    inputSchema: {
      type: "object",
      properties: { filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, "/events/counts/access", { filter: args.filter as string }),
  },
  {
    name: "Events: Count_audit_events",
    description: "Count audit events matching a filter.",
    inputSchema: {
      type: "object",
      properties: { filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, "/events/counts/audit", { filter: args.filter as string }),
  },
];
