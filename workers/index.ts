import { createAlertWorker } from "../lib/queue/alertWorker";
import { alertQueue } from "../lib/queue/jobs";

console.log("Starting TradeFlow workers...");

const alertWorker = createAlertWorker();

alertWorker.on("completed", (job) => {
  console.log(`Job ${job.name} completed`);
});

alertWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.name} failed:`, err.message);
});

// Schedule recurring jobs
async function setupCronJobs() {
  // Check overdue stages every 15 minutes
  await alertQueue.add(
    "check-overdue-stages",
    {},
    {
      repeat: { every: 15 * 60 * 1000 },
      removeOnComplete: { count: 100 },
    }
  );

  // Check document expiry daily at 8am
  await alertQueue.add(
    "check-document-expiry",
    {},
    {
      repeat: { pattern: "0 8 * * *" },
      removeOnComplete: { count: 100 },
    }
  );

  console.log("Cron jobs scheduled.");
}

setupCronJobs().catch(console.error);

console.log("Workers running. Waiting for jobs...");
