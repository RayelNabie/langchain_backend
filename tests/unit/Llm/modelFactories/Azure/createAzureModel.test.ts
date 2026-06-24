import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AzureChatOpenAI } from '@langchain/openai';
import { createAzureModel } from '#Llm/modelFactories/Azure/createAzureModel.js';
import { azureConfig } from '#Llm/modelFactories/Azure/AzureConfig.js';

vi.mock('@langchain/openai', () => ({
  AzureChatOpenAI: vi.fn().mockImplementation(function () {
    return { invoke: vi.fn(), stream: vi.fn() };
  }),
}));

vi.mock('#Llm/modelFactories/Azure/AzureConfig.js', () => ({
  azureConfig: {
    azureApiKey: 'fake-key',
    azureInstanceName: 'fake-instance',
    azureDeploymentName: 'fake-deployment',
    azureApiVersion: '2025-01-01',
  },
}));

describe('createAzureModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    azureConfig.azureApiKey = 'fake-key';
  });

  it('should throw an error if configuration is missing', () => {
    azureConfig.azureApiKey = '';

    expect(() => createAzureModel()).toThrow(
      '[createAzureModel] Missing Azure OpenAI configuration',
    );
  });

  it('should construct an AzureChatOpenAI client with the configured values', () => {
    createAzureModel();

    expect(AzureChatOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        azureOpenAIApiKey: 'fake-key',
        azureOpenAIApiInstanceName: 'fake-instance',
        azureOpenAIApiDeploymentName: 'fake-deployment',
        azureOpenAIApiVersion: '2025-01-01',
      }),
    );
  });
});
