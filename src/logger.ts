import { appendFileSync, writeFileSync } from "node:fs";

let logFilePath: string | undefined;

// Call once at startup with a path (DEV_MODE=true) or undefined (DEV_MODE=false, the default).
// Truncates the file so every session starts clean - one file, always just the current run,
// not a growing history.
export function initLogger(path: string | undefined): void {
  logFilePath = path;
  if (logFilePath) {
    try {
      writeFileSync(logFilePath, "", "utf-8");
    } catch {
      // best-effort - a logging failure should never take down the server
    }
  }
}

// Appends to the log file when DEV_MODE is on; otherwise a no-op. Does not print anywhere
// itself - call sites still decide separately whether/where to print (stderr vs stdout).
export function writeLog(message: string): void {
  if (!logFilePath) return;

  try {
    appendFileSync(logFilePath, `[${new Date().toISOString()}] ${message}\n`, "utf-8");
  } catch {
    // best-effort - a logging failure should never take down the server
  }
}
