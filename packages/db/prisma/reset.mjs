import "dotenv/config";
import pg from "pg";
const logger = console;

const connectionString =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set");
}

const pool = new pg.Pool({ connectionString });

async function main() {
  await pool.query(`
    TRUNCATE TABLE
      "JobEvent",
      "Escrow",
      "StakeTransaction",
      "ProviderMetric",
      "Job",
      "Provider",
      "Session",
      "Account",
      "User"
    RESTART IDENTITY CASCADE
  `);

  logger.info("Database reset complete.");
}

main()
  .catch((error) => {
    logger.error("Database reset failed.");
    logger.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
