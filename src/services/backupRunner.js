import fsp from "node:fs/promises";
import path from "node:path";
import {
  MONGODB_DATABASE,
  EXCLUDED_COLLECTION,
  BACKUP_DIR,
} from "../configs/env.config.js";
import { acquireLock, releaseLock } from "./lockService.js";
import { runMongoDump } from "./mongoDumpService.js";
import { uploadToR2, verifyR2Object } from "./r2Service.js";
import { sendEmail } from "./emailService.js";
import { calculateSha256 } from "../utils/hash.js";
import { getISTTimestamp } from "../utils/time.js";
import { formatBytes } from "../utils/formatters.js";

let backupRunning = false;

export async function runBackup() {
  if (backupRunning) {
    console.log("Backup already running. Skipping.");
    return;
  }

  backupRunning = true;

  let lockAcquired = false;
  let localFile = null;

  const timestamp = getISTTimestamp();
  const startedAt = Date.now();

  try {
    lockAcquired = await acquireLock();

    if (!lockAcquired) {
      return;
    }

    const fileName = `${timestamp.time}-IST.archive.gz`;
    localFile = path.join(BACKUP_DIR, fileName);
    const objectKey = `dynamic/${timestamp.date}/${fileName}`;

    console.log("");
    console.log("========================================");
    console.log("MongoDB backup started");
    console.log(`Time: ${timestamp.readable}`);
    console.log(`Database: ${MONGODB_DATABASE}`);
    console.log(`Excluded: ${EXCLUDED_COLLECTION || "None"}`);
    console.log(`R2: ${objectKey}`);
    console.log("========================================");
    console.log("");

    await runMongoDump(localFile);

    const stat = await fsp.stat(localFile);
    if (!stat.isFile() || stat.size <= 0) {
      throw new Error("mongodump produced an empty or invalid file.");
    }
    console.log(`Backup created: ${formatBytes(stat.size)}`);

    console.log("Calculating SHA-256...");
    const sha256 = await calculateSha256(localFile);
    console.log(`SHA-256: ${sha256}`);

    const uploadResult = await uploadToR2(localFile, objectKey, sha256);

    await verifyR2Object(objectKey, uploadResult.size, sha256);

    await fsp.unlink(localFile);
    localFile = null;
    console.log("Local temporary backup deleted.");

    const duration = Math.round((Date.now() - startedAt) / 1000);
    const message =
      `MongoDB backup completed successfully.\n\n` +
      `Time: ${timestamp.readable}\n` +
      `Database: ${MONGODB_DATABASE}\n` +
      `Excluded collection: ${EXCLUDED_COLLECTION || "None"}\n` +
      `Backup size: ${formatBytes(uploadResult.size)}\n` +
      `Duration: ${duration} seconds\n` +
      `R2 object: ${objectKey}\n` +
      `SHA-256: ${sha256}`;

    console.log("");
    console.log(message);

    await sendEmail(
      `MongoDB Backup Successful - ${timestamp.readable}`,
      message
    );

  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("MONGODB BACKUP FAILED");
    console.error(error);
    console.error("========================================");

    const message =
      `MongoDB backup FAILED.\n\n` +
      `Time: ${timestamp.readable}\n` +
      `Database: ${MONGODB_DATABASE}\n` +
      `Excluded collection: ${EXCLUDED_COLLECTION || "None"}\n\n` +
      `Error:\n` +
      `${error.stack || error.message}\n\n` +
      `Local file:\n` +
      `${localFile ?? "None"}`;

    await sendEmail(
      `MongoDB Backup FAILED - ${timestamp.readable}`,
      message
    );
  } finally {
    if (lockAcquired) {
      await releaseLock();
    }
    backupRunning = false;
  }
}
