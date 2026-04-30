import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AzureChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  SystemMessage,
  HumanMessage,
  type BaseMessage,
  type BaseMessageChunk,
} from '@langchain/core/messages';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import OpenAi from '#Models/Openai.js';
import { openaiConfig } from '#Config/openai.js';

vi.mock('@langchain/openai', () => {
  return {
    AzureChatOpenAI: vi.fn().mockImplementation(function () {
      return {
        invoke: vi.fn(),
        stream: vi.fn(),
      };
    }),
  };
});

vi.mock('@langchain/community/stores/message/postgres', () => {
  return {
    PostgresChatMessageHistory: vi.fn().mockImplementation(() => ({
      getMessages: vi.fn().mockResolvedValue([]),
      addMessage: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

vi.mock('@langchain/core/runnables', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@langchain/core/runnables')>();
  return {
    ...actual,
    RunnableWithMessageHistory: vi.fn().mockImplementation(function () {
      return {
        invoke: vi.fn().mockResolvedValue(
          new AIMessage({
            content: 'Response with history',
            response_metadata: {},
          }),
        ),
        stream: vi.fn().mockResolvedValue({
          [Symbol.asyncIterator]: async function* () {
            yield { content: 'Chunk 1', response_metadata: {} };
          },
        }),
      };
    }),
  };
});

vi.mock('#Config/openai.js', () => ({
  openaiConfig: {
    azureApiKey: { value: 'fake-key' },
    azureInstanceName: { value: 'fake-instance' },
    azureDeploymentName: { value: 'fake-deployment' },
    azureApiVersion: { value: '2025-01-01' },
  },
}));

describe('OpenAi Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    OpenAi.reset();
  });

  it('should throw an error if configuration is missing', async () => {
    openaiConfig.azureApiKey.value = '';

    await expect(OpenAi.ask('Hello')).rejects.toThrow(
      '[OpenAi] Missing Azure OpenAI configuration',
    );
  });

  it('should return the same instance of AzureChatOpenAI (singleton)', () => {
    openaiConfig.azureApiKey.value = 'valid-key';
    const instance1 = OpenAi.getInstance();
    const instance2 = OpenAi.getInstance();
    expect(instance1).toBe(instance2);
    expect(AzureChatOpenAI).toHaveBeenCalledTimes(1);
  });

  it('should call invoke and return formatted response (happy flow)', async () => {
    openaiConfig.azureApiKey.value = 'valid-key';

    const mockInvoke = vi.fn().mockResolvedValue(
      new AIMessage({
        content: 'AI Response',
        usage_metadata: {
          input_tokens: 5,
          output_tokens: 5,
          total_tokens: 10,
        },
        response_metadata: { model: 'gpt-4' },
      }),
    );

    vi.mocked(AzureChatOpenAI).mockImplementation(function () {
      return {
        invoke: mockInvoke,
      } as unknown as AzureChatOpenAI;
    });

    const result: BaseMessage = await OpenAi.ask('Hello AI');

    expect(result.content).toBe('AI Response');
    if (AIMessage.isInstance(result)) {
      expect(result.usage_metadata).toEqual({
        input_tokens: 5,
        output_tokens: 5,
        total_tokens: 10,
      });
    }
    expect(mockInvoke).toHaveBeenCalledWith([
      expect.any(SystemMessage),
      new HumanMessage('Hello AI'),
    ]);

    const messages = mockInvoke.mock.calls[0][0];
    if (Array.isArray(messages) && messages[0] instanceof SystemMessage) {
      const systemMessage = messages[0];
      expect(systemMessage.content).toContain('AI Coach');
      expect(systemMessage.content).toContain('voetbal-app');
    }
  });

  it('should call stream and return an async iterable', async () => {
    openaiConfig.azureApiKey.value = 'valid-key';

    const mockStream = vi.fn().mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        yield { content: 'Chunk 1', response_metadata: {} };
        yield { content: 'Chunk 2', response_metadata: {} };
      },
    });

    vi.mocked(AzureChatOpenAI).mockImplementation(function () {
      return {
        stream: mockStream,
      } as unknown as AzureChatOpenAI;
    });

    const stream: AsyncIterable<BaseMessageChunk> = await OpenAi.stream('Hello AI');
    const chunks: BaseMessageChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(2);
    expect(chunks[0].content).toBe('Chunk 1');
    expect(mockStream).toHaveBeenCalledWith([
      expect.any(SystemMessage),
      new HumanMessage('Hello AI'),
    ]);
  });

  it('should use RunnableWithMessageHistory when sessionId is provided', async () => {
    openaiConfig.azureApiKey.value = 'valid-key';

    const result: BaseMessage = await OpenAi.ask('Hello AI', 'session-123');

    expect(RunnableWithMessageHistory).toHaveBeenCalled();
    expect(result.content).toBe('Response with history');
  });

  it('should use RunnableWithMessageHistory for streaming when sessionId is provided', async () => {
    openaiConfig.azureApiKey.value = 'valid-key';

    const stream: AsyncIterable<BaseMessageChunk> = await OpenAi.stream('Hello AI', 'session-123');
    const chunks: BaseMessageChunk[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(RunnableWithMessageHistory).toHaveBeenCalled();
    expect(chunks[0].content).toBe('Chunk 1');
  });
});
