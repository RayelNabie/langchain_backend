/**
 * @file Shape of the Azure OpenAI (LangChain) chat model config.
 *
 * @module Llm/modelFactories/Azure/createAzureModel
 * @author RayelNabie
 */

export interface AzureConfig {
  azureApiKey: string;
  azureInstanceName: string;
  azureDeploymentName: string;
  azureApiVersion: string;
  azureEmbeddingsDeploymentName: string;
}
