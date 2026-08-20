import path from "node:path";
import {
  BACKUP_DIR,
  BACKUP_TIMEOUT_MINUTES,
  R2_ACCOUNT_ID,
} from "./env.config.js";

export const BACKUP_TIMEOUT_MS =
  Number(BACKUP_TIMEOUT_MINUTES) * 60 * 1000;

export const LOCK_FILE = path.join(BACKUP_DIR, ".backup.lock");

export const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export default {
  BACKUP_TIMEOUT_MS,
  LOCK_FILE,
  R2_ENDPOINT,
};
