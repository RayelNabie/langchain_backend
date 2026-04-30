import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AzureChatOpenAI } from '@langchain/openai';
import { AIMessage, SystemMessage, HumanMessage } from '@langchain/core/messages';
import OpenAi from '#Models/Openai.js';
import { openaiConfig } from '#Config/openai.js';

vi.mock('@langchain/openai', () => {
  return {
    AzureChatOpenAI: vi.fn().mockImplementation(function () {
      return {
        invoke: vi.fn(),
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
    // @ts-expect-error - Accessing private property for testing
    OpenAi.instance = null;
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
      } as never;
    });

    const result = await OpenAi.ask('Hello AI');

    expect(result.answer).toBe('AI Response');
    expect(result.usage).toEqual({
      input_tokens: 5,
      output_tokens: 5,
      total_tokens: 10,
    });
    expect(mockInvoke).toHaveBeenCalledWith([
      expect.any(SystemMessage),
      new HumanMessage('Hello AI'),
    ]);

    const systemMessage = mockInvoke.mock.calls[0][0][0] as SystemMessage;
    expect(systemMessage.content).toContain('AI Coach');
    expect(systemMessage.content).toContain('voetbal-app');
  });
});
