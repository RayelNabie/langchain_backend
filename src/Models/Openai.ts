import { AzureChatOpenAI } from '@langchain/openai';
import {
  BaseMessage,
  type BaseMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { type RunnableConfig, RunnableWithMessageHistory } from '@langchain/core/runnables';
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { openaiConfig } from '#Config/openai.js';
import { databaseConfig } from '#Config/database.js';

export default class OpenAi {
  private static instance: AzureChatOpenAI | null = null;

  private static readonly SYSTEM_PROMPT: string =
    'Je bent de AI Coach van een voetbal-app die spelers helpt bij het tracken en loggen van hun voetbal-drills, vergelijkbaar met de Hevy-app. ' +
    'Je bent een expert in jeugdvoetbal en baseert je advies op de methodiek van jeugdvoetbalcoach.nl. ' +
    'Je doel is om spelers te helpen hun techniek, tactiek en conditie te verbeteren door middel van positie-specifiek advies. ' +
    'Als een speler moeite heeft met een oefening, geef dan directe feedback, praktische tips (zoals standbeen-positie) en stel eventueel een alternatieve basis-oefening voor. ' +
    'Je toon is motiverend, duidelijk en deskundig.';

  public static getInstance(): AzureChatOpenAI {
    if (!this.instance) {
      const apiKey: string = openaiConfig.azureApiKey;
      const instanceName: string = openaiConfig.azureInstanceName;
      const deploymentName: string = openaiConfig.azureDeploymentName;

      if (!apiKey || !instanceName || !deploymentName) {
        throw new Error(
          '[OpenAi] Missing Azure OpenAI configuration. Please check your .env file.',
        );
      }

      this.instance = new AzureChatOpenAI({
        azureOpenAIApiKey: apiKey,
        azureOpenAIApiInstanceName: instanceName,
        azureOpenAIApiDeploymentName: deploymentName,
        azureOpenAIApiVersion: openaiConfig.azureApiVersion,
        temperature: 0.7,
        maxRetries: 3,
        streaming: true,
      });
    }

    return this.instance;
  }

  /**
   * Resets the singleton instance (for testing purposes)
   */
  public static reset(): void {
    this.instance = null;
  }

  /**
   * Returns a ChatMessageHistory instance for a given session
   */
  private static async getHistory(sessionId: string): Promise<PostgresChatMessageHistory> {
    return new PostgresChatMessageHistory({
      poolConfig: {
        connectionString: databaseConfig.url,
      },
      tableName: 'chat_history',
      sessionId: sessionId,
    });
  }

  /**
   * Creates a runnable chain with history support
   */
  private static getChainWithHistory(): RunnableWithMessageHistory<
    { input: string },
    BaseMessageChunk
  > {
    const model: AzureChatOpenAI = this.getInstance();

    const prompt: ChatPromptTemplate = ChatPromptTemplate.fromMessages([
      ['system', this.SYSTEM_PROMPT],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ]);

    const chain = prompt.pipe(model);

    return new RunnableWithMessageHistory<{ input: string }, BaseMessageChunk>({
      runnable: chain,
      getMessageHistory: (sessionId: string) => this.getHistory(sessionId),
      inputMessagesKey: 'input',
      historyMessagesKey: 'history',
    });
  }

  /**
   * Sends a prompt to OpenAI and returns the response
   */
  public static async ask(prompt: string, sessionId?: string): Promise<BaseMessage> {
    if (!sessionId) {
      // Fallback to simple invocation without history if no sessionId is provided
      const model: AzureChatOpenAI = this.getInstance();
      const messages: BaseMessage[] = [
        new SystemMessage(this.SYSTEM_PROMPT),
        new HumanMessage(prompt),
      ];
      return await model.invoke(messages);
    }

    const chain: RunnableWithMessageHistory<{ input: string }, BaseMessageChunk> =
      this.getChainWithHistory();
    const config: RunnableConfig = { configurable: { sessionId } };

    return await chain.invoke({ input: prompt }, config);
  }

  /**
   * Streams the response from OpenAI
   */
  public static async stream(
    prompt: string,
    sessionId?: string,
  ): Promise<IterableReadableStream<BaseMessageChunk>> {
    if (!sessionId) {
      const model: AzureChatOpenAI = this.getInstance();
      const messages: BaseMessage[] = [
        new SystemMessage(this.SYSTEM_PROMPT),
        new HumanMessage(prompt),
      ];
      return model.stream(messages);
    }

    const chain: RunnableWithMessageHistory<{ input: string }, BaseMessageChunk> =
      this.getChainWithHistory();
    const config: RunnableConfig = { configurable: { sessionId } };

    return chain.stream({ input: prompt }, config);
  }
}
