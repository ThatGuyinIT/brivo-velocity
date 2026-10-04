import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOKEN_CACHE_FILENAME = "brivo-velocity.token.json";

interface CachedToken {
  refreshToken: string;
}

function cachePath(appDir: string): string {
  return join(appDir, TOKEN_CACHE_FILENAME);
}

export function loadCachedRefreshToken(appDir: string): string | undefined {
  const path = cachePath(appDir);
  if (!existsSync(path)) return undefined;

  try {
    const data = JSON.parse(readFileSync(path, "utf-8")) as CachedToken;
    return data.refreshToken;
  } catch {
    return undefined;
  }
}

export function saveCachedRefreshToken(appDir: string, refreshToken: string): void {
  const data: CachedToken = { refreshToken };
  writeFileSync(cachePath(appDir), JSON.stringify(data, null, 2), "utf-8");
}

export function clearCachedRefreshToken(appDir: string): void {
  const path = cachePath(appDir);
  if (!existsSync(path)) return;

  try {
    unlinkSync(path);
  } catch {
    // best-effort cleanup - a stale/unreadable cache just gets overwritten on next login anyway
  }
}
