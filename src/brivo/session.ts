import { authorizationCodeGrant, getBrivoUrls, passwordGrant, refreshGrant, type BrivoTokens } from "./auth.js";
import { clearCachedRefreshToken, loadCachedRefreshToken, saveCachedRefreshToken } from "./token-store.js";
import { writeLog } from "../logger.js";

export interface BrivoCredentials {
  environment?: string;
  grantType?: string;
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  redirectUri?: string;
}

export function credentialsFromEnv(env: NodeJS.ProcessEnv): BrivoCredentials {
  return {
    environment: env.BRIVO_ENVIRONMENT,
    grantType: env.BRIVO_GRANT_TYPE,
    clientId: env.BRIVO_CLIENT_ID,
    clientSecret: env.BRIVO_CLIENT_SECRET,
    apiKey: env.BRIVO_API_KEY,
    username: env.BRIVO_USERNAME,
    password: env.BRIVO_PASSWORD,
    redirectUri: env.BRIVO_REDIRECT_URI,
  };
}

// Matches the buffer already proven in the sibling brivo-device-audit project's
// token_expired(buffer_seconds=5) - treat a token as expired this many seconds before
// its real expiry, so a slow request never gets caught crossing the actual deadline.
const EXPIRY_SAFETY_MARGIN_MS = 5_000;

// Lazily logs in on first use (not at startup) and keeps the access token refreshed for the
// life of the process. Refresh tokens are cached to disk (brivo-velocity.token.json, next to
// brivo-velocity.env) so an authorization_code teammate isn't forced through a browser login
// on every restart - only when the cached refresh token itself stops working.
export class BrivoSession {
  private tokens: BrivoTokens | undefined;

  constructor(
    private readonly appDir: string,
    private readonly creds: BrivoCredentials,
  ) {}

  get apiBase(): string {
    return getBrivoUrls(this.creds.environment).apiBase;
  }

  // Data-API calls (api.brivo.com) need this alongside the bearer access token - auth
  // calls (auth.brivo.com) need it too, but that's handled internally by auth.ts already.
  get apiKey(): string {
    return this.requireCoreCredentials().apiKey;
  }

  async getAccessToken(): Promise<string> {
    if (this.tokens && this.tokens.expiresAt - EXPIRY_SAFETY_MARGIN_MS > Date.now()) {
      writeLog("BrivoSession: reusing cached access token (still valid).");
      return this.tokens.accessToken;
    }

    const { authBase } = getBrivoUrls(this.creds.environment);
    const { clientId, clientSecret, apiKey } = this.requireCoreCredentials();

    const cachedRefreshToken = this.tokens?.refreshToken ?? loadCachedRefreshToken(this.appDir);
    if (cachedRefreshToken) {
      writeLog("BrivoSession: access token missing/expired - attempting refresh_token grant.");
      try {
        this.tokens = await refreshGrant({ authBase, apiKey, clientId, clientSecret, refreshToken: cachedRefreshToken });
        saveCachedRefreshToken(this.appDir, this.tokens.refreshToken);
        writeLog("BrivoSession: refresh succeeded.");
        return this.tokens.accessToken;
      } catch (err) {
        // Per Brivo's docs: only force a full re-login if the refresh request itself fails.
        writeLog(`BrivoSession: refresh failed (${(err as Error).message}) - falling back to full login.`);
        clearCachedRefreshToken(this.appDir);
      }
    }

    const grantType = (this.creds.grantType ?? "password").toLowerCase();
    writeLog(`BrivoSession: performing full login (grant_type=${grantType}).`);
    this.tokens = await this.login(authBase, clientId, clientSecret, apiKey);
    saveCachedRefreshToken(this.appDir, this.tokens.refreshToken);
    return this.tokens.accessToken;
  }

  private async login(
    authBase: string,
    clientId: string,
    clientSecret: string,
    apiKey: string,
  ): Promise<BrivoTokens> {
    const grantType = (this.creds.grantType ?? "password").toLowerCase();

    if (grantType === "authorization_code") {
      if (!this.creds.redirectUri) {
        throw new Error("BRIVO_REDIRECT_URI is required when BRIVO_GRANT_TYPE=authorization_code.");
      }
      return authorizationCodeGrant({
        authBase,
        apiKey,
        clientId,
        clientSecret,
        redirectUri: this.creds.redirectUri,
      });
    }

    if (grantType === "password") {
      if (!this.creds.username || !this.creds.password) {
        throw new Error("BRIVO_USERNAME and BRIVO_PASSWORD are required when BRIVO_GRANT_TYPE=password.");
      }
      return passwordGrant({
        authBase,
        apiKey,
        clientId,
        clientSecret,
        username: this.creds.username,
        password: this.creds.password,
      });
    }

    throw new Error(`Unknown BRIVO_GRANT_TYPE "${this.creds.grantType}" - expected "password" or "authorization_code".`);
  }

  private requireCoreCredentials(): { clientId: string; clientSecret: string; apiKey: string } {
    const { clientId, clientSecret, apiKey } = this.creds;
    if (!clientId || !clientSecret || !apiKey) {
      throw new Error(
        "BRIVO_CLIENT_ID, BRIVO_CLIENT_SECRET, and BRIVO_API_KEY are all required - fill them in in brivo-velocity.env.",
      );
    }
    return { clientId, clientSecret, apiKey };
  }
}
