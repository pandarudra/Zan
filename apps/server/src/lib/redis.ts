import { Redis } from "ioredis";
import { logger } from "./logger.js";

/**
 * Factory - call once per Queue/Worker instance.
 * BullMQ requires separate connections for Queue vs Worker
 * because the worker uses blocking Redis commands (BRPOP / BLMOVE)
 * that would stall any other commands on a shared connection.
 */
export function makeRedisConnection(): Redis {
  const url = process.env["REDIS_URL"];
  if (!url)
    throw new Error("[Redis] REDIS_URL environment variable is not set");

  const conn = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  conn.on("connect", () => logger.info("[Redis] Connected"));
  conn.on("error", (err: Error) =>
    logger.error({ err: err.message }, "[Redis] Error"),
  );

  return conn;
}
