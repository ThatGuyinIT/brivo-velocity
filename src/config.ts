import { existsSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import dotenv from "dotenv";

const ENV_FILENAME = "brivo-velocity.env";

// Keep this in sync with brivo-velocity.env.example at the repo root.
const ENV_TEMPLATE = `# Brivo Access API connection settings.
# Fill in your own values - see references/brivo-access-api-overview.md for the full auth reference.
# Keep this file next to brivo-velocity.exe - it holds your own credentials, don't share it.
#
# IMPORTANT: if any value contains a # character (a password can legitimately have one),
# wrap the whole value in double quotes, e.g. BRIVO_PASSWORD="my#password". Unquoted, an
# unescaped # is treated as a comment and everything after it is silently dropped - this
# will look exactly like a wrong password, not a parsing error.

# Which Brivo environment your account lives in: "prod" or "eu"
BRIVO_ENVIRONMENT=prod

# Which OAuth2 grant type your Brivo Application is registered for: "password" or "authorization_code"
# These are set per-Application in Brivo's Marketplace ("Generate API Token") and are not
# interchangeable at runtime - use whichever one matches how your Application was registered.
BRIVO_GRANT_TYPE=password

# --- Required for every grant type ---
# From developer.brivo.com/apps/mykeys and your Application's details page in Access > Marketplace.
BRIVO_CLIENT_ID=
BRIVO_CLIENT_SECRET=
BRIVO_API_KEY=

# --- Required only when BRIVO_GRANT_TYPE=password ---
# Your own Brivo admin login. Restricts this Application to your account only.
BRIVO_USERNAME=
BRIVO_PASSWORD=

# --- Required only when BRIVO_GRANT_TYPE=authorization_code ---
# Must exactly match the Redirect URI registered on the Brivo Application.
BRIVO_REDIRECT_URI=

# Set to "true" to also write a log file (same name as this app, with a .log extension)
# next to it. Each run starts that file fresh - it always holds just the current/most
# recent session, not a running history. Leave "false" for normal use.
DEV_MODE=false
`;

// Once packaged (pkg or Node SEA), argv[1] no longer points at a real script file on disk,
// so this falls back to the running executable's own path - see ToDo.md packaging note.
// Shared by getAppDir() and getLogFilePath() so both agree on where "here" is.
function getRunningExecutablePath(): string {
  const scriptPath = process.argv[1];
  if (scriptPath && existsSync(scriptPath)) {
    return scriptPath;
  }
  return process.execPath;
}

function getAppDir(): string {
  return dirname(getRunningExecutablePath());
}

// e.g. .../brivo-velocity.exe -> .../brivo-velocity.log - one fixed file, same name every
// run. initLogger() truncates it at startup, so it always holds just the current session.
export function getLogFilePath(): string {
  const exePath = getRunningExecutablePath();
  const name = basename(exePath, extname(exePath));
  return join(dirname(exePath), `${name}.log`);
}

export interface ConfigResult {
  env: NodeJS.ProcessEnv;
  envPath: string;
  appDir: string;
  justCreated: boolean;
  devMode: boolean;
}

export function loadConfig(): ConfigResult {
  const appDir = getAppDir();
  const envPath = join(appDir, ENV_FILENAME);
  const justCreated = !existsSync(envPath);

  if (justCreated) {
    writeFileSync(envPath, ENV_TEMPLATE, "utf-8");
  }

  dotenv.config({ path: envPath });

  const devMode = (process.env.DEV_MODE ?? "false").trim().toLowerCase() === "true";

  return { env: process.env, envPath, appDir, justCreated, devMode };
}
