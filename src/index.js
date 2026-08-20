import { validateEnv } from "./configs/env.config.js";
import { verifySmtp } from "./services/emailService.js";
import { startScheduler } from "./scheduler/cron.js";

async function main() {
  validateEnv();
  await verifySmtp();
  startScheduler();
}

main().catch((error) => {
  console.error("Fatal application error:", error);
  process.exit(1);
});
