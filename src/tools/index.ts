import { accessPointTools } from "./access-point.js";
import { accountTools } from "./account.js";
import { activityTools } from "./activity.js";
import { administratorTools } from "./administrator.js";
import { applicationTools } from "./application.js";
import { assignmentsTools } from "./assignments.js";
import { cameraTools } from "./camera.js";
import { controlPanelTools } from "./control-panel.js";
import { credentialTools } from "./credential.js";
import { currentDateTimeTools } from "./current-date-time.js";
import { customFieldTools } from "./custom-field.js";
import { digitalCredentialsTools } from "./digital-credentials.js";
import { digitalInvitationsTools } from "./digital-invitations.js";
import { emergencyScenarioTools } from "./emergency-scenario.js";
import { eventSubscriptionTools } from "./event-subscription.js";
import { eventsTools } from "./events.js";
import { featuresTools } from "./features.js";
import { groupTools } from "./group.js";
import { holidaysTools } from "./holidays.js";
import { passTools } from "./pass.js";
import { roleTools } from "./role.js";
import { scheduleTools } from "./schedule.js";
import { siteTools } from "./site.js";
import type { ToolDefinition } from "./types.js";
import { userTools } from "./user.js";

// Every GET (read-only) endpoint in the Brivo Access API, across all ~24 tags - see
// docs/project-spec.md -> Scope for the full tag/endpoint-count breakdown and the one
// deliberate exclusion (Guest, which has no GET endpoints at all).
export const allTools: ToolDefinition[] = [
  ...siteTools,
  ...accessPointTools,
  ...controlPanelTools,
  ...accountTools,
  ...activityTools,
  ...administratorTools,
  ...applicationTools,
  ...assignmentsTools,
  ...cameraTools,
  ...credentialTools,
  ...currentDateTimeTools,
  ...customFieldTools,
  ...digitalCredentialsTools,
  ...digitalInvitationsTools,
  ...emergencyScenarioTools,
  ...eventSubscriptionTools,
  ...eventsTools,
  ...featuresTools,
  ...groupTools,
  ...holidaysTools,
  ...passTools,
  ...roleTools,
  ...scheduleTools,
  ...userTools,
];

export type { ToolDefinition } from "./types.js";
