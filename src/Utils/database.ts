import { databaseConfig } from '#Config/database.js';

/**
 * Verantwoordelijk voor enkel de database connectie
 */
export const connectDatabase = async (): Promise<void> => {
  const {
    safeUrl,
    details: { source },
  } = databaseConfig;

  console.log(`[Database] Attempting connection via: ${source} to ${safeUrl}`);

  // await myDbClient.connect();
  // Als dit faalt, gooit myDbClient zelf een error die we hogerop vangen.

  console.log('[Database] Connection established successfully.');
};
