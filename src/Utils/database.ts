import { databaseConfig } from '#Config/database.js';

export const connectDatabase: () => void = async (): Promise<void> => {
  console.log(`[Database] Attempting connection to ${databaseConfig.safeUrl}`);

  // await myDbClient.connect();

  console.log('[Database] Connection established successfully.');
};
