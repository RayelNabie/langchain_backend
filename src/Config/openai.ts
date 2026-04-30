import { getSecret, type SecretResult } from '#Utils/secrets.js';

interface OpenAiConfig {
  azureApiKey: SecretResult;
  azureInstanceName: SecretResult;
  azureDeploymentName: SecretResult;
  azureApiVersion: SecretResult;
  azureEmbeddingsDeploymentName: SecretResult;
}

export const openaiConfig: OpenAiConfig = {
  get azureApiKey(): SecretResult {
    return getSecret('azure_openai_api_key', '');
  },

  get azureInstanceName(): SecretResult {
    return getSecret('azure_openai_api_instance_name', '');
  },

  get azureDeploymentName(): SecretResult {
    return getSecret('azure_openai_api_deployment_name', '');
  },

  get azureApiVersion(): SecretResult {
    return getSecret('azure_openai_api_version', '2025-03-01-preview');
  },

  get azureEmbeddingsDeploymentName(): SecretResult {
    return getSecret('azure_openai_api_embeddings_deployment_name', '');
  },
};
