import fsp from "node:fs/promises";
import { BACKUP_DIR } from "../configs/env.config.js";
import { BACKUP_TIMEOUT_MS, LOCK_FILE } from "../configs/constants.js";

export async function acquireLock() {
  await fsp.mkdir(BACKUP_DIR, { recursive: true });

  try {
    const handle = await fsp.open(LOCK_FILE, "wx");

    await handle.writeFile(
      JSON.stringify({
        pid: process.pid,
        startedAt: new Date().toISOString(),
      })
    );

    await handle.close();
    console.log("Backup lock acquired.");
    return true;

  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }

    try {
      const stat = await fsp.stat(LOCK_FILE);
      const age = Date.now() - stat.mtimeMs;
      const staleAfter = BACKUP_TIMEOUT_MS + 30 * 60 * 1000;

      if (age > staleAfter) {
        console.warn("Stale backup lock found. Removing it.");
        await fsp.unlink(LOCK_FILE);
        return acquireLock();
      }
    } catch (statError) {
      if (statError.code !== "ENOENT") {
        throw statError;
      }
    }

    console.log("Another backup is running. Skipping.");
    return false;
  }
}

export async function releaseLock() {
  try {
    await fsp.unlink(LOCK_FILE);
    console.log("Backup lock released.");
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to release backup lock:", error);
    }
  }
}
