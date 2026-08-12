import WebSocket from "ws";
import { store } from "./store";
import { BrowserWindow } from "electron";
import { cancelRunningJob, runJob, type JobPayload } from "./job-runner";
import pino from "pino";

const logger = pino();

let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let mainWin: BrowserWindow | null = null;

export function connectWebSocket(win: BrowserWindow | null) {
  mainWin = win;
  const providerId = store.get("providerId");
  if (!providerId) return;

  const baseUrl = store.get("apiUrl").replace(/\/api$/, "");
  const wsUrl = baseUrl
    .replace("http://", "ws://")
    .replace("https://", "wss://");

  ws = new WebSocket(`${wsUrl}/ws?providerId=${providerId}`);

  ws.on("open", () => {
    logger.info("[WS] Connected");
    mainWin?.webContents.send("ws-status", "connected");
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case "JOB_ASSIGNED": {
          const jobPayload = msg.payload as JobPayload;
          store.set("currentJobId", jobPayload.jobId);
          mainWin?.webContents.send("job-assigned", jobPayload);

          // Run job in background — never blocks the WebSocket
          runJob(jobPayload, (progress) => {
            mainWin?.webContents.send("job-progress", {
              jobId: jobPayload.jobId,
              message: progress,
            });
          })
            .then(() => {
              store.set("currentJobId", null);
              mainWin?.webContents.send("job-finished", {
                jobId: jobPayload.jobId,
              });
            })
            .catch((err) => {
              logger.error({ err: err.message }, "[WS] Job runner crashed");
              store.set("currentJobId", null);
              mainWin?.webContents.send("job-error", {
                jobId: jobPayload.jobId,
                error: err.message,
              });
            });
          break;
        }

        case "JOB_CANCELLED": {
          const currentJobId = store.get("currentJobId");
          const cancelledJobId = String(
            msg.payload?.jobId ?? currentJobId ?? "",
          );
          if (cancelledJobId) {
            void cancelRunningJob(cancelledJobId);
          }
          store.set("currentJobId", null);
          mainWin?.webContents.send("job-cancelled", msg.payload);
          break;
        }

        case "PING":
          ws?.send(JSON.stringify({ type: "PONG" }));
          break;

        default:
          logger.warn("[WS] Unknown message type:", msg.type);
      }
    } catch {
      // Ignore malformed messages
    }
  });

  ws.on("close", () => {
    logger.info("[WS] Disconnected — reconnecting in 5s");
    mainWin?.webContents.send("ws-status", "disconnected");
    reconnectTimer = setTimeout(() => connectWebSocket(mainWin), 5000);
  });

  ws.on("error", (err) => {
    logger.error({ err: err.message }, "[WS] Error");
    ws?.terminate();
  });
}

export function disconnectWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  ws?.close();
  ws = null;
  mainWin?.webContents.send("ws-status", "disconnected");
}
