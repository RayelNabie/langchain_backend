import { AzureChatOpenAI } from '@langchain/openai';
import {
  BaseMessage,
  AIMessage,
  SystemMessage,
  HumanMessage,
  type BaseMessageChunk,
} from '@langchain/core/messages';
import { IterableReadableStream } from '@langchain/core/utils/stream';
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
   * Returns the messages array for the AI Coach
   */
  private static getMessages(prompt: string): BaseMessage[] {
    return [
      new SystemMessage(
        'Je bent de AI Coach van een voetbal-app die spelers helpt bij het tracken en loggen van hun voetbal-drills, vergelijkbaar met de Hevy-app. ' +
          'Je bent een expert in jeugdvoetbal en baseert je advies op de methodiek van coerver ' +
          'Je doel is om spelers te helpen hun techniek, tactiek en conditie te verbeteren door middel van positie-specifiek advies. ' +
          'Als een speler moeite heeft met een oefening, geef dan directe feedback, praktische tips (zoals standbeen-positie) en stel eventueel een alternatieve basis-oefening voor. ' +
          'Je toon is motiverend, duidelijk en deskundig.',
      ),
      new HumanMessage(prompt),
    ];
  }

  /**
   * Sends a prompt to OpenAI and returns the response
   */
  public static async ask(prompt: string): Promise<OpenaiResponse> {
    const model: AzureChatOpenAI = this.getInstance();
    const messages: BaseMessage[] = this.getMessages(prompt);

    const response: BaseMessage = await model.invoke(messages);

    const result: OpenaiResponse = {
      answer: response.content,
      metadata: response.response_metadata,
    };

    if (AIMessage.isInstance(response)) {
      result.usage = response.usage_metadata;
    }

    return result;
  }

  /**
   * Streams the response from OpenAI
   */
  public static async stream(prompt: string): Promise<IterableReadableStream<BaseMessageChunk>> {
    const model: AzureChatOpenAI = this.getInstance();
    const messages: BaseMessage[] = this.getMessages(prompt);

    return model.stream(messages);
  }
}
