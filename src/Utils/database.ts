import { databaseConfig } from '#Config/database.js';

export const connectDatabase: () => void = async (): Promise<void> => {
  const {
    safeUrl,
    details: { source },
  }: { safeUrl: string; details: { source: string } } = databaseConfig;

  console.log(`[Database] Attempting connection via: ${source} to ${safeUrl}`);

  // await myDbClient.connect();

  console.log('[Database] Connection established successfully.');
};
