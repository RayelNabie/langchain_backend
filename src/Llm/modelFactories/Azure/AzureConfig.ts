/**
 * @file Azure OpenAI configuration, derived from environment variables.
 *
 * @module Llm/modelFactories/Azure/AzureConfig
 * @author RayelNabie
 */

import type { AzureConfig } from '#Llm/modelFactories/Azure/types.js';

export const azureConfig: AzureConfig = {
  get azureApiKey(): string {
    return process.env.AZURE_OPENAI_API_KEY ?? '';
  },

  get azureInstanceName(): string {
    return process.env.AZURE_OPENAI_API_INSTANCE_NAME ?? '';
  },

  get azureDeploymentName(): string {
    return process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME ?? '';
  },

  get azureApiVersion(): string {
    return process.env.AZURE_OPENAI_API_VERSION ?? '2025-03-01-preview';
  },

  get azureEmbeddingsDeploymentName(): string {
    return process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME ?? '';
  },
};
