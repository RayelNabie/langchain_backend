import { databaseConfig } from '#Config/database.js';
import { openaiConfig } from '#Config/openai.js';

export const validateConfig: () => void = (): void => {
  if (!databaseConfig?.safeUrl) {
    throw new Error('[Config] Database config is not available');
  }

  const isProduction: boolean = process.env.NODE_ENV === 'production';
  const hasOpenAiConfig: boolean =
    !!openaiConfig.azureApiKey &&
    !!openaiConfig.azureInstanceName &&
    !!openaiConfig.azureDeploymentName;

  if (!hasOpenAiConfig) {
    if (isProduction) {
      throw new Error('[Config] OpenAI/Azure configuration is missing!');
    } else {
      console.warn(
        '[Config] WARNING: OpenAI/Azure configuration is missing. AI features will fail.',
      );
    }
  }
};
