import { AzureChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { openaiConfig } from '#Config/openai.js';

export class OpenAiModel {
  private static instance: AzureChatOpenAI | null = null;

  public static getInstance(): AzureChatOpenAI {
    if (!this.instance) {
      console.log('[Model] Initializing AzureChatOpenAI instance...');

      this.instance = new AzureChatOpenAI({
        azureOpenAIApiKey: openaiConfig.azureApiKey.value,
        azureOpenAIApiInstanceName: openaiConfig.azureInstanceName.value,
        azureOpenAIApiDeploymentName: openaiConfig.azureDeploymentName.value,
        azureOpenAIApiVersion: openaiConfig.azureApiVersion.value,
        temperature: 0.7,
        maxRetries: 3,
        streaming: true,
      });
    }

    return this.instance;
  }
}

export const getAiModel: () => AzureChatOpenAI<ChatOpenAICallOptions> =
  (): AzureChatOpenAI<ChatOpenAICallOptions> => {
    return OpenAiModel.getInstance();
  };
