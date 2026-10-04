import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const controlPanelTools: ToolDefinition[] = [
  {
    name: "Control Panel: List_control_panels",
    description: "List all Brivo control panels (door controller hardware).",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/control-panels", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Control Panel: Get_control_panel",
    description: "Retrieve a single Brivo control panel by id.",
    inputSchema: {
      type: "object",
      properties: { controlPanelId: idProperty("The Brivo control panel id, e.g. from Control Panel: List_control_panels.") },
      required: ["controlPanelId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/control-panels/${args.controlPanelId}`),
  },
  {
    name: "Control Panel: Get_control_panel_firmware",
    description: "Get the firmware version/status of a control panel.",
    inputSchema: {
      type: "object",
      properties: { controlPanelId: idProperty("The Brivo control panel id.") },
      required: ["controlPanelId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/control-panels/${args.controlPanelId}/firmware`),
  },
];
