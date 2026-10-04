import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getLogFilePath, loadConfig } from "./config.js";
import { BrivoSession, credentialsFromEnv } from "./brivo/session.js";
import { BrivoApiError, isBrivoImageResult } from "./brivo/client.js";
import { initLogger, writeLog } from "./logger.js";
import { allTools } from "./tools/index.js";

// Wrapped in an async main() rather than top-level await - the exe build (scripts/build-exe.mjs)
// bundles this to CommonJS for Node's SEA embedder, which doesn't support top-level await.
async function main(): Promise<void> {
  // stdout is reserved for the MCP JSON-RPC protocol - all diagnostic output must go to stderr.
  const { env, envPath, appDir, justCreated, devMode } = loadConfig();

  initLogger(devMode ? getLogFilePath() : undefined);
  if (devMode) {
    writeLog(`brivo-velocity starting (DEV_MODE=true). appDir=${appDir}`);
  }

  function announce(message: string): void {
    console.error(message);
    writeLog(message);
  }

  if (justCreated) {
    announce(`Created ${envPath} - fill in your Brivo credentials before using this server.`);
  } else if (!env.BRIVO_CLIENT_ID) {
    announce(`${envPath} is missing BRIVO_CLIENT_ID - Brivo tools will not work until it's filled in.`);
  }

  // Standalone diagnostic path - not part of the MCP protocol, run directly from a terminal:
  //   brivo-velocity.exe --test-login
  // Exercises the real login flow (password or authorization_code, per BRIVO_GRANT_TYPE) and
  // exits, without starting the stdio server. Safe to print to stdout here since this mode
  // never speaks MCP JSON-RPC.
  if (process.argv.includes("--test-login")) {
    const session = new BrivoSession(appDir, credentialsFromEnv(env));
    try {
      const token = await session.getAccessToken();
      const message = `Login succeeded (grant type: ${env.BRIVO_GRANT_TYPE ?? "password"}).`;
      console.log(message);
      writeLog(message);
      console.log(`Access token (truncated): ${token.slice(0, 12)}...`);
      process.exit(0);
    } catch (err) {
      const message = `Login failed: ${(err as Error).message}`;
      console.error(message);
      writeLog(message);
      process.exit(1);
    }
  }

  const server = new Server(
    { name: "brivo-velocity", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  const session = new BrivoSession(appDir, credentialsFromEnv(env));

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools.map(({ name, description, inputSchema, annotations }) => ({ name, description, inputSchema, annotations })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = allTools.find((t) => t.name === request.params.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    try {
      const result = await tool.handler(session, request.params.arguments ?? {});
      // Generic, not specific to any one tool - any GET could turn out to return an image
      // (confirmed necessary for User: Get_user_photo, see project-spec.md).
      if (isBrivoImageResult(result)) {
        return { content: [{ type: "image", data: result.data, mimeType: result.mimeType }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      const message = err instanceof BrivoApiError ? err.message : `Tool call failed: ${(err as Error).message}`;
      writeLog(`Tool call failed: ${request.params.name} - ${message}`);
      return { content: [{ type: "text", text: message }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
