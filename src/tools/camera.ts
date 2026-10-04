import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, booleanProperty, filterProperty, idProperty, offsetProperty, pageSizeProperty, stringProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

// Technically part of the Brivo Access API per the context file, but overlaps conceptually
// with the separate EagleEye/video API - included here per the broader "all read-only
// endpoints" scope, reversing the earlier v1 decision to leave it out.
export const cameraTools: ToolDefinition[] = [
  {
    name: "Camera: List_cameras",
    description: "List all Brivo cameras.",
    inputSchema: {
      type: "object",
      properties: { filter: filterProperty, offset: offsetProperty, pageSize: pageSizeProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/cameras", {
        filter: args.filter as string,
        offset: args.offset as number,
        pageSize: args.pageSize as number,
      }),
  },
  {
    name: "Camera: Get_camera",
    description: "Retrieve a single Brivo camera by id.",
    inputSchema: {
      type: "object",
      properties: {
        cameraId: idProperty("The Brivo camera id, e.g. from Camera: List_cameras."),
        showStatus: booleanProperty("Include live camera status with the result."),
      },
      required: ["cameraId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/cameras/${args.cameraId}`, { showStatus: args.showStatus as boolean }),
  },
  {
    name: "Camera: List_camera_access_points",
    description: "List the access points associated with a camera.",
    inputSchema: {
      type: "object",
      properties: { cameraId: idProperty("The Brivo camera id.") },
      required: ["cameraId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/cameras/${args.cameraId}/access-points`),
  },
  {
    name: "Camera: List_camera_video_clips",
    description: "List video clips for a camera within a time range.",
    inputSchema: {
      type: "object",
      properties: {
        cameraId: idProperty("The Brivo camera id."),
        startTime: stringProperty("Start of the time range (ISO 8601), e.g. 2026-01-01T00:00:00Z."),
        endTime: stringProperty("End of the time range (ISO 8601), e.g. 2026-01-02T00:00:00Z."),
      },
      required: ["cameraId", "startTime", "endTime"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, `/cameras/${args.cameraId}/video`, {
        startTime: args.startTime as string,
        endTime: args.endTime as string,
      }),
  },
];
