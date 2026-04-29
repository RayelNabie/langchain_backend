import { databaseConfig } from '#Config/database.js';
import { openaiConfig } from '#Config/openai.js';

export const validateConfig: () => void = (): void => {
  if (!databaseConfig?.details?.source || !databaseConfig?.safeUrl) {
    throw new Error('[Config] Database config is not available');
  }

  const isProduction: boolean = process.env.NODE_ENV === 'production';
  const hasOpenAiConfig: boolean =
    !!openaiConfig.azureApiKey.value &&
    !!openaiConfig.azureInstanceName.value &&
    !!openaiConfig.azureDeploymentName.value;

  if (!hasOpenAiConfig) {
    if (isProduction) {
      throw new Error('[Config] OpenAI/Azure configuration is missing!');
    } else {
      console.warn(
        '[Config] WARNING: OpenAI/Azure configuration is missing. AI features will fail.',
      );
    }
  }

  const usesDefault: boolean = databaseConfig.details.source.includes('default');

  // block local db credentials in production
  if (isProduction && usesDefault) {
    throw new Error('[Security] FATAL: Default database credentials in production!');
  }

  if (!isProduction && usesDefault) {
    console.warn('[Security] Warning: Using default database credentials locally.');
  }
};
