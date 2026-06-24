/**
 * @file Builds and validates the Azure OpenAI (LangChain) chat model.
 *
 * @module Llm/modelFactories/Azure/createAzureModel
 * @author RayelNabie
 */

import { AzureChatOpenAI } from '@langchain/openai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { azureConfig } from '#Llm/modelFactories/Azure/AzureConfig.js';

export const createAzureModel = (): BaseChatModel => {
  const apiKey: string = azureConfig.azureApiKey;
  const instanceName: string = azureConfig.azureInstanceName;
  const deploymentName: string = azureConfig.azureDeploymentName;

  if (!apiKey || !instanceName || !deploymentName) {
    throw new Error(
      '[createAzureModel] Missing Azure OpenAI configuration. Please check your .env file.',
    );
  }

  return new AzureChatOpenAI({
    azureOpenAIApiKey: apiKey,
    azureOpenAIApiInstanceName: instanceName,
    azureOpenAIApiDeploymentName: deploymentName,
    azureOpenAIApiVersion: azureConfig.azureApiVersion,
    temperature: 0.7,
    maxRetries: 3,
    streaming: true,
  });
};
