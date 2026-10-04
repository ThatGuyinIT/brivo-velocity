// Shared JSON-schema property fragments for the Brivo pagination/filter/id conventions
// documented in references/brivo-access-llms.txt and references/brivo-access-api-overview.md.

export const offsetProperty = {
  type: "integer",
  description: "Skip the first N results. Default: 0.",
};

export const pageSizeProperty = {
  type: "integer",
  description: "Max results to return. Default: 20. Max: 100.",
};

export const filterProperty = {
  type: "string",
  description:
    'Brivo filter syntax: "<field>__<op>:<value>[,<value>...]", operators eq/ne/gt/lt, multiple filters separated by ";". ' +
    'Example: "id__eq:11,22,33;name__eq:Acme". See the per-endpoint reference for which fields are filterable.',
};

export function idProperty(description: string): Record<string, unknown> {
  return { type: ["string", "number"], description };
}

export function stringProperty(description: string): Record<string, unknown> {
  return { type: "string", description };
}

export function booleanProperty(description: string): Record<string, unknown> {
  return { type: "boolean", description };
}

// Every v1 tool is a GET against Brivo - see ToolAnnotations in types.ts for why readOnlyHint
// is the lever that actually controls which top-level bucket ("Read-only tools" vs.
// "Write/delete tools") Claude Desktop puts a tool in.
//
// Do NOT add a per-tag `title` here. Confirmed in the real Claude Desktop UI: `title` fully
// REPLACES the displayed tool name rather than grouping/clustering anything - setting it to
// e.g. "Site" on all 8 Site tools made every one of them show up as an indistinguishable
// "Site" entry in the permissions list. There is no sub-grouping lever beyond the binary
// read-only/write split - see project-spec.md's MCP tools section.
export const READ_ONLY_ANNOTATIONS = { readOnlyHint: true, openWorldHint: true } as const;
