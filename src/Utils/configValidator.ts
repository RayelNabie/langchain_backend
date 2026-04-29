import { databaseConfig } from '#Config/database.js';
import { openaiConfig } from '#Config/openai.js';

export const validateConfig: () => void = (): void => {
  if (!databaseConfig?.details?.source || !databaseConfig?.safeUrl) {
    throw new Error('[Config] Database config is not available');
  }

  if (!openaiConfig.azureApiKey.value) {
    throw new Error('[Config] OpenAI API key is missing.');
  }
  if (!openaiConfig.azureInstanceName.value) {
    throw new Error('[Config] Azure OpenAI Instance Name is missing.');
  }
  if (!openaiConfig.azureDeploymentName.value) {
    throw new Error('[Config] Azure OpenAI Deployment Name is missing.');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const usesDefault = databaseConfig.details.source.includes('default');

  // block local db credentials in production
  if (isProduction && usesDefault) {
    throw new Error('[Security] FATAL: Default database credentials in production!');
  }

  if (!isProduction && usesDefault) {
    console.warn('[Security] Warning: Using default database credentials locally.');
  }
};
