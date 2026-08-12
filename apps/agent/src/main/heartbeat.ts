import { store } from "./store";
import { getGpuMetrics } from "./detect";
import { agentRequest } from "./api-client";
import pino from "pino";

const logger = pino();

export class HeartbeatService {
  private interval: NodeJS.Timeout | null = null;
  private readonly INTERVAL_MS = 30_000;

  start() {
    if (this.interval) return; // already running
    this.ping();
    this.interval = setInterval(() => this.ping(), this.INTERVAL_MS);
    logger.info("[Heartbeat] Started");
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    logger.info("[Heartbeat] Stopped");
  }

  isRunning() {
    return this.interval !== null;
  }

  private async ping() {
    try {
      const providerId = store.get("providerId");
      if (!providerId) return;

      const metrics = await getGpuMetrics();

      await agentRequest("post", "/providers/heartbeat", {
        gpuUtilization: metrics?.utilization ?? 0,
        vramUsedMb: metrics?.vramUsedMb ?? 0,
        temperatureC: metrics?.temperatureC ?? 0,
        isBusy: store.get("currentJobId") !== null,
      });
    } catch {
      // server marks offline after 90s automatically
    }
  }
}
