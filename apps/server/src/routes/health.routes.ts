import { Router } from "express";
import { jobQueue } from "../queues/jobQueue.js";

export const healthRouter: Router = Router();

healthRouter.get("/", (_, res) =>
  res.json({ ok: true, ts: new Date().toISOString() }),
);
healthRouter.get("/queue", async (_, res) => {
  try {
    const counts = await jobQueue.getJobCounts(
      "waiting",
      "active",
      "failed",
      "delayed",
    );
    res.json({ ok: true, queue: "job-matching", counts });
  } catch (err) {
    res.status(503).json({ ok: false, error: (err as Error).message });
  }
});
