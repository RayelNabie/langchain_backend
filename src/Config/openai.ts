import { getSecret, type SecretResult } from '#Utils/secrets.js';

export const openaiConfig = {
  get azureApiKey(): SecretResult {
    return getSecret('azure_openai_api_key', '');
  },

  get azureInstanceName(): SecretResult {
    return getSecret('azure_openai_instance_name', '');
  },

  get azureDeploymentName(): SecretResult {
    return getSecret('azure_openai_deployment_name', '');
  },

  get azureApiVersion(): SecretResult {
    return getSecret('azure_openai_api_version', '2024-02-01');
  },
};
