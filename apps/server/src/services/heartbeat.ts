import { prisma } from "@repo/db";
import { logger } from "../lib/logger.js";

export function startHeartbeatMonitor() {
  setInterval(async () => {
    try {
      const result = await prisma.provider.updateMany({
        where: {
          status: { in: ["ACTIVE", "BUSY"] },
          lastHeartbeat: {
            lt: new Date(Date.now() - 90_000), // missed 3 heartbeats
          },
        },
        data: { status: "OFFLINE" },
      });

      if (result.count > 0) {
        logger.info(`Marked ${result.count} providers offline`);
      }
    } catch (err) {
      logger.error({ err }, "Heartbeat monitor error:");
    }
  }, 30_000);
  logger.info("Heartbeat monitor started");
}
