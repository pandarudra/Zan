import pino from "pino";

const level = process.env.LOG_LEVEL ?? "info";
export let logger: pino.Logger;
if (process.env.NODE_ENV !== "production") {
  const transport = pino.transport({ target: "pino-pretty" });
  logger = pino({ level }, transport);
} else {
  logger = pino({ level });
}
