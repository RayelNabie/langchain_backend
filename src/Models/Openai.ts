import { AzureChatOpenAI } from '@langchain/openai';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { openaiConfig } from '#Config/openai.js';
import type OpenaiResponse from '#Types/OpenaiResponse.js';

export default class OpenAi {
  private static instance: AzureChatOpenAI | null = null;

  public static getInstance(): AzureChatOpenAI {
    if (!this.instance) {
      const apiKey: string = openaiConfig.azureApiKey.value;
      const instanceName: string = openaiConfig.azureInstanceName.value;
      const deploymentName: string = openaiConfig.azureDeploymentName.value;

      if (!apiKey || !instanceName || !deploymentName) {
        throw new Error(
          '[OpenAi] Missing Azure OpenAI configuration. Please check your secrets files.',
        );
      }

      this.instance = new AzureChatOpenAI({
        azureOpenAIApiKey: apiKey,
        azureOpenAIApiInstanceName: instanceName,
        azureOpenAIApiDeploymentName: deploymentName,
        azureOpenAIApiVersion: openaiConfig.azureApiVersion.value,
        temperature: 0.7,
        maxRetries: 3,
        streaming: true,
      });
    }

    return this.instance;
  }

  /**
   * Sends a prompt to OpenAI and returns the response
   */
  public static async ask(prompt: string): Promise<OpenaiResponse> {
    const model: AzureChatOpenAI = this.getInstance();
    const response: BaseMessage = await model.invoke(prompt);

    const result: OpenaiResponse = {
      answer: response.content,
      metadata: response.response_metadata,
    };

    if (AIMessage.isInstance(response)) {
      result.usage = response.usage_metadata;
    }

    return result;
  }
}
