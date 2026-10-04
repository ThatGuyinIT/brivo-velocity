import type { BrivoSession } from "../brivo/session.js";

// Standard MCP tool annotations (see the spec's Tool Annotations Interest Group) - UX hints
// only, not security boundaries. Claude Desktop's Tool Permissions page buckets tools by
// these (e.g. readOnlyHint: true -> "Read-only tools"), same mechanism the obsidian-mcp
// connector uses for its own "Read-only tools"/"Write/delete tools" split. There's no
// custom-category field in the spec - this is the only grouping lever that exists.
export interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  annotations?: ToolAnnotations;
  handler: (session: BrivoSession, args: Record<string, unknown>) => Promise<unknown>;
}
