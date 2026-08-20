import cron from "node-cron";
import { runBackup } from "../services/backupRunner.js";

export function startScheduler() {
  // Backups at 08:00, 11:00, 14:00, 17:00, 20:00, 23:00 IST
  cron.schedule(
    "0 8-23/3 * * *",
    () => {
      console.log("Scheduled backup triggered.");
      void runBackup();
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  // Backup at 02:00 IST
  cron.schedule(
    "0 2 * * *",
    () => {
      console.log("Scheduled 02:00 backup triggered.");
      void runBackup();
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("Backup scheduler started.");
  console.log("Schedule:");
  console.log("02:00, 08:00, 11:00, 14:00, 17:00, 20:00, 23:00 IST");
}
