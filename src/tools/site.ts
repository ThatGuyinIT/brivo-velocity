import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const siteTools: ToolDefinition[] = [
  {
    name: "Site: List_sites",
    description: "List all Brivo sites.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/sites", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Site: List_root_sites",
    description: "List Brivo root sites (top-level sites with no parent).",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/sites/root", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Site: List_sites_proximity",
    description: "List proximity (Bluetooth/WiFi mobile-pass) information across all sites.",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/sites/proximity", { offset: args.offset as number, pageSize: args.pageSize as number }),
  },
  {
    name: "Site: Get_site",
    description: "Retrieve a single Brivo site by id.",
    inputSchema: {
      type: "object",
      properties: { siteId: idProperty("The Brivo site id, e.g. from Site: List_sites.") },
      required: ["siteId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/sites/${args.siteId}`),
  },
  {
    name: "Site: List_site_access_points",
    description: "List the access points (doors) belonging to a site.",
    inputSchema: {
      type: "object",
      properties: { siteId: idProperty("The Brivo site id."), filter: filterProperty },
      required: ["siteId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/sites/${args.siteId}/access-points`, { filter: args.filter as string }),
  },
  {
    name: "Site: List_site_cameras",
    description: "List the cameras associated with a site.",
    inputSchema: {
      type: "object",
      properties: { siteId: idProperty("The Brivo site id.") },
      required: ["siteId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/sites/${args.siteId}/cameras`),
  },
  {
    name: "Site: List_site_groups",
    description: "List the access groups associated with a site.",
    inputSchema: {
      type: "object",
      properties: { siteId: idProperty("The Brivo site id.") },
      required: ["siteId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/sites/${args.siteId}/groups`),
  },
  {
    name: "Site: Get_site_proximity",
    description: "Get proximity (Bluetooth/WiFi mobile-pass) information for a single site.",
    inputSchema: {
      type: "object",
      properties: { siteId: idProperty("The Brivo site id.") },
      required: ["siteId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/sites/${args.siteId}/proximity`),
  },
];
