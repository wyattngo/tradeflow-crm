import { Queue } from "bullmq";
import { redis } from "../redis";

export const alertQueue = new Queue("alerts", { connection: redis });
export const reportQueue = new Queue("reports", { connection: redis });
