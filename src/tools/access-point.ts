import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const accessPointTools: ToolDefinition[] = [
  {
    name: "Access Point: List_access_points",
    description: "List all Brivo access points (doors/entry points).",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/access-points", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Access Point: Get_access_point",
    description: "Retrieve a single Brivo access point by id.",
    inputSchema: {
      type: "object",
      properties: { accessPointId: idProperty("The Brivo access point id, e.g. from Access Point: List_access_points.") },
      required: ["accessPointId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/access-points/${args.accessPointId}`),
  },
  {
    name: "Access Point: List_access_point_cameras",
    description: "List the cameras associated with an access point.",
    inputSchema: {
      type: "object",
      properties: {
        accessPointId: idProperty("The Brivo access point id."),
        offset: offsetProperty,
        pageSize: pageSizeProperty,
      },
      required: ["accessPointId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, `/access-points/${args.accessPointId}/cameras`, {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
      }),
  },
  {
    name: "Access Point: List_access_point_groups",
    description: "List the access groups with permission on an access point.",
    inputSchema: {
      type: "object",
      properties: {
        accessPointId: idProperty("The Brivo access point id."),
        offset: offsetProperty,
        pageSize: pageSizeProperty,
      },
      required: ["accessPointId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, `/access-points/${args.accessPointId}/groups`, {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
      }),
  },
  {
    name: "Access Point: Get_access_point_status",
    description: "Get the live connectivity/device status of an access point.",
    inputSchema: {
      type: "object",
      properties: { accessPointId: idProperty("The Brivo access point id.") },
      required: ["accessPointId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/device-status/${args.accessPointId}`),
  },
];
