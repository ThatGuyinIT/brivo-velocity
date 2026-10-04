import { brivoGet } from "../brivo/client.js";
import { READ_ONLY_ANNOTATIONS, filterProperty, idProperty, offsetProperty, pageSizeProperty } from "./schema-helpers.js";
import type { ToolDefinition } from "./types.js";

export const eventSubscriptionTools: ToolDefinition[] = [
  {
    name: "Event Subscription: List_event_subscriptions",
    description: "List all configured event subscriptions (webhooks).",
    inputSchema: {
      type: "object",
      properties: { offset: offsetProperty, pageSize: pageSizeProperty, filter: filterProperty },
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) =>
      brivoGet(session, "/event-subscriptions", {
        offset: args.offset as number,
        pageSize: args.pageSize as number,
        filter: args.filter as string,
      }),
  },
  {
    name: "Event Subscription: Get_event_subscription",
    description: "Retrieve a single event subscription by id.",
    inputSchema: {
      type: "object",
      properties: {
        eventSubscriptionId: idProperty("The Brivo event subscription id, e.g. from Event Subscription: List_event_subscriptions."),
      },
      required: ["eventSubscriptionId"],
    },
    annotations: READ_ONLY_ANNOTATIONS,
    handler: (session, args) => brivoGet(session, `/event-subscriptions/${args.eventSubscriptionId}`),
  },
];
