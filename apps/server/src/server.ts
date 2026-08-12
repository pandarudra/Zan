import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./routes/auth.routes.js";
import { providerRouter } from "./routes/provider.routes.js";
import { jobRouter } from "./routes/job.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { createServer, Server } from "http";
import { setupWebSocketServer } from "./ws/server.js";
import { startHeartbeatMonitor } from "./jobs/heartbeatMonitor.js";
import { startMatchmakerWorker } from "./workers/matchmaker.worker.js";
import { jobQueue, type JobMatchPayload } from "./queues/jobQueue.js";
import { logger } from "./lib/logger.js";
import type { Worker } from "bullmq";
import { prisma } from "@repo/db";
import { makeRedisConnection } from "./lib/redis.js";

async function waitForDependencies() {
  logger.info("Waiting for dependencies to be ready...");
  
  // Wait for Database
  let dbReady = false;
  while (!dbReady) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbReady = true;
      logger.info("[Database] Connected and ready");
    } catch (err) {
      logger.warn("[Database] Not ready yet, retrying in 2s...");
      await new Promise((res) => setTimeout(res, 2000));
    }
  }

  // Wait for Redis
  let redisReady = false;
  const redis = makeRedisConnection();
  while (!redisReady) {
    try {
      await redis.ping();
      redisReady = true;
      logger.info("[Redis] PING successful");
    } catch (err) {
      logger.warn("[Redis] Not ready yet, retrying in 2s...");
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  await redis.quit();
}

export const runServer = async () => {
  await waitForDependencies();

  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [
        "http://localhost:3000",
        "http://localhost:3001",
      ],
      credentials: true,
    }),
  );
  app.use(express.json());

  // routes
  app.use("/api/auth", authRouter);
  app.use("/api/providers", providerRouter);
  app.use("/api/jobs", jobRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/health", healthRouter);
  app.use((_, res) => res.status(404).json({ error: "Not found" }));

  const server = createServer(app);
  setupWebSocketServer(server);
  startHeartbeatMonitor();
  const matchmakerWorker = startMatchmakerWorker();

  const PORT = process.env.PORT ?? 3001;
  server.listen(PORT, () => {
    logger.info(`Server running at port : ${PORT}`);
  });

  const forceExitAfterMs = 10_000;
  process.on("SIGTERM", () => {
    shutdown("SIGTERM", matchmakerWorker, server);
    setTimeout(() => {
      logger.error("Force exit after timeout");
      process.exit(1);
    }, forceExitAfterMs).unref();
  });
  process.on("SIGINT", () => {
    shutdown("SIGINT", matchmakerWorker, server);
    setTimeout(() => {
      logger.error("Force exit after timeout");
      process.exit(1);
    }, forceExitAfterMs).unref();
  });
};

async function shutdown(
  signal: string,
  matchmakerWorker: Worker<JobMatchPayload>,
  server: Server,
) {
  logger.info({ signal }, "Shutdown received — shutting down gracefully");
  server.close(); // stop accepting new HTTP/WS connections
  await matchmakerWorker.close(); // wait for in-flight matchmaker jobs to complete
  await jobQueue.close(); // close queue Redis connection
  logger.info("Clean exit");
  process.exit(0);
}
