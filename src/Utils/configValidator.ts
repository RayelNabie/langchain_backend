import { databaseConfig } from '#Config/database.js';

/**
 * Guard Clause: Valideer de configuratie (Fail fast)
 */
export const validateConfig = (): void => {
  if (!databaseConfig?.details?.source || !databaseConfig?.safeUrl) {
    throw new Error('[Config] Database configuratie ontbreekt of is corrupt.');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const usesDefault = databaseConfig.details.source.includes('default');

  // Harde block als we in productie zijn met default credentials (Negative space)
  if (isProduction && usesDefault) {
    throw new Error('[Security] FATAL: Default database credentials in productie!');
  }

  // Zachte waarschuwing in dev
  if (!isProduction && usesDefault) {
    console.warn('[Security] Warning: Using default database credentials locally.');
  }
};
