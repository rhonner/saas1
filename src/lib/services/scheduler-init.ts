import cron from "node-cron";
import { runSchedulerJobs } from "./scheduler";

export function startScheduler(): void {
  console.log("Scheduler started");

  cron.schedule("*/30 * * * *", async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Running scheduled jobs...`);
    await runSchedulerJobs();
  });
}
