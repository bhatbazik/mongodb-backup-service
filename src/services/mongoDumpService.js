import { spawn } from "node:child_process";
import {
  MONGODB_URI,
  MONGODB_DATABASE,
  EXCLUDED_COLLECTION,
  BACKUP_TIMEOUT_MINUTES,
} from "../configs/env.config.js";
import { BACKUP_TIMEOUT_MS } from "../configs/constants.js";


export function runMongoDump(outputFile) {
  return new Promise((resolve, reject) => {
    console.log("Starting mongodump...");

    const args = [
      `--uri=${MONGODB_URI}`,
      `--db=${MONGODB_DATABASE}`,
    ];

    if (EXCLUDED_COLLECTION) {
      args.push(`--excludeCollection=${EXCLUDED_COLLECTION}`);
    }

    args.push(`--archive=${outputFile}`, "--gzip");

    let isSettled = false;
    let stderr = "";

    const child = spawn("mongodump", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });

    const timeout = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;

      console.error("mongodump exceeded timeout.");
      child.kill("SIGTERM");

      const forceKillTimer = setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch { }
      }, 10_000);
      forceKillTimer.unref();

      reject(
        new Error(
          `mongodump exceeded ${BACKUP_TIMEOUT_MINUTES} minutes`
        )
      );
    }, BACKUP_TIMEOUT_MS);

    child.on("error", (error) => {
      clearTimeout(timeout);
      if (isSettled) return;
      isSettled = true;
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (isSettled) return;
      isSettled = true;

      if (code !== 0) {
        reject(
          new Error(
            `mongodump failed with exit code ${code}\n\n${stderr}`
          )
        );
        return;
      }

      resolve();
    });
  });
}
