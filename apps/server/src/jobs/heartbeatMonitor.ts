// src/jobs/heartbeatMonitor.ts
import { prisma } from "@repo/db";
import { logger } from "../lib/logger.js";

export function startHeartbeatMonitor() {
  setInterval(async () => {
    try {
      const result = await prisma.provider.updateMany({
        where: {
          status: { in: ["ACTIVE", "BUSY"] },
          lastHeartbeat: { lt: new Date(Date.now() - 90_000) },
        },
        data: { status: "OFFLINE" },
      });

      if (result.count > 0) {
        logger.info(
          `[HeartbeatMonitor] Marked ${result.count} provider(s) offline`,
        );
      }
    } catch (err) {
      logger.error({ err }, "[HeartbeatMonitor] Error");
    }
  }, 30_000);

  logger.info("[HeartbeatMonitor] Started");
}
