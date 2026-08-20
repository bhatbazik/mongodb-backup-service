import { validateEnv } from "./configs/env.config.js";
import { runBackup } from "./services/backupRunner.js";

// Execute manual backup if called directly via CLI (node src/backup.js)
if (process.argv[1] && process.argv[1].endsWith("backup.js")) {
  try {
    validateEnv();
    await runBackup();
  } catch (error) {
    console.error("Manual backup execution failed:", error);
    process.exit(1);
  }
}

export { runBackup };
