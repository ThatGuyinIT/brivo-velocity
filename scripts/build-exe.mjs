// -------------------------------------------------------------
// Bundles src/index.ts into a single CommonJS file (Node's SEA embedder runs
//              the main script as CJS regardless of package.json's "type": "module", and
//              our dependencies are themselves ESM - bundling sidesteps both), generates a
//              Node Single Executable Application blob, and injects it into a copy of the
//              running node binary to produce dist/brivo-velocity(.exe).
// -------------------------------------------------------------
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inject } from "postject";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, "dist");
const bundlePath = join(distDir, "bundle.cjs");
const blobPath = join(distDir, "sea-prep.blob");
const isWindows = process.platform === "win32";
const isMac = process.platform === "darwin";
const exePath = join(distDir, isWindows ? "brivo-velocity.exe" : "brivo-velocity");
const seaConfigPath = join(root, "sea-config.json");

if (!existsSync(distDir)) mkdirSync(distDir);

console.log("Bundling src/index.ts -> dist/bundle.cjs (CommonJS, all deps inlined)...");
await build({
  entryPoints: [join(root, "src", "index.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  outfile: bundlePath,
  logLevel: "info",
});

console.log("Generating SEA blob...");
execFileSync(process.execPath, ["--experimental-sea-config", seaConfigPath], {
  stdio: "inherit",
  cwd: root,
});

console.log(`Copying node binary -> ${exePath}...`);
copyFileSync(process.execPath, exePath);

if (isMac) {
  // Required before injecting on macOS - the running node binary is already signed,
  // and postject can't modify a signed binary's segments in place.
  console.log("Removing existing code signature (required before injection on macOS)...");
  execFileSync("codesign", ["--remove-signature", exePath], { stdio: "inherit" });
}

console.log("Injecting SEA blob via postject (in-process API - avoids Windows shell-quoting");
console.log("issues with this repo's path, which contains spaces and a comma)...");
await inject(exePath, "NODE_SEA_BLOB", readFileSync(blobPath), {
  sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
  ...(isMac ? { machoSegmentName: "NODE_SEA" } : {}),
});

if (isMac) {
  // Ad-hoc signing only (no Apple Developer account/notarization) - see ToDo.md.
  // Users will still need to right-click -> Open past Gatekeeper the first time.
  console.log("Re-signing ad-hoc (no Apple Developer account - see ToDo.md)...");
  execFileSync("codesign", ["--sign", "-", exePath], { stdio: "inherit" });
}

console.log(`Done: ${exePath}`);
