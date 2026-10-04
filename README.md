# brivo-velocity

An MCP ([Model Context Protocol](https://modelcontextprotocol.io)) server that gives Claude read-only access to the [Brivo Access Control API](https://www.brivo.com/) — sites, access points, control panels, users, credentials, schedules, cameras, and more.

## What it does

Exposes every read-only (`GET`) endpoint of Brivo's Access API as an MCP tool — 75 in total — so Claude can look up and reason about your Brivo account's access-control data directly in conversation: list sites, check a door's live status, pull a user's photo, inspect schedules and holidays, and more. No write/control actions (unlock, credential changes, user edits, etc.) are implemented — this is a read-only tool by design.

## Status

- **Windows:** working, distributed as a compiled standalone `.exe` — no Node.js install required.
- **macOS:** implemented, not yet verified on a real Mac. Signed ad-hoc only (no Apple Developer account) — you'll need to right-click → Open the first time to get past Gatekeeper's "unidentified developer" warning.

## Requirements

- Windows (for now)
- Your own Brivo Access API credentials: a Client ID/Secret and API key from [developer.brivo.com](https://developer.brivo.com/apps/mykeys), plus either your Brivo admin username/password (`password` grant) or a registered redirect URI (`authorization_code` grant) — matching however your Brivo Application is registered in Brivo's Marketplace.

## Setup

1. Get `brivo-velocity.exe` (see Building from source below) and put it somewhere permanent, e.g. alongside any other local MCP servers you run.
2. Run it once, or just add it to Claude Desktop's config and launch Claude — it creates a `brivo-velocity.env` file next to itself with blank placeholders on first run.
3. Fill in `brivo-velocity.env` with your own Brivo credentials. If any value contains a `#`, wrap it in double quotes (e.g. `BRIVO_PASSWORD="my#password"`) — otherwise everything after the `#` is silently dropped as a comment.
4. Add it to Claude Desktop's MCP config (`claude_desktop_config.json`):
   ```json
   "brivo-velocity": {
     "command": "C:\\path\\to\\brivo-velocity.exe",
     "args": [],
     "env": {}
   }
   ```
5. Restart Claude Desktop. You should see all 75 tools under "Read-only tools" in that connector's Tool Permissions page.

## Building from source

Requires Node.js 24+.

```bash
npm install
npm run build    # compiles TypeScript -> dist/
npm run package  # bundles everything into dist/brivo-velocity.exe (Windows only, for now)
```

## Development

```bash
npm run test:read-only  # exercises every tool against a real Brivo account end to end
```

## License

MIT — see [LICENSE](./LICENSE).
