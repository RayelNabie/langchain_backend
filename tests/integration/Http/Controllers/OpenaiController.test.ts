import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import OpenAi from '#Models/Openai.js';
import type OpenaiResponse from '#Types/OpenaiResponse.js';

vi.mock('#Models/Openai.js', () => ({
  default: {
    ask: vi.fn(),
    stream: vi.fn(),
  },
}));

describe('OpenaiController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /ask', () => {
    it('should return 200 and AI response for a valid prompt (happy flow)', async () => {
      const mockResponse: OpenaiResponse = {
        answer: 'Hello, I am an AI!',
        usage: {
          input_tokens: 10,
          output_tokens: 10,
          total_tokens: 20,
        },
        metadata: {
          modelName: 'gpt-4',
        },
      };

      vi.mocked(OpenAi.ask).mockResolvedValue(mockResponse);

      const response = await request(app).post('/ask').send({ prompt: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(OpenAi.ask).toHaveBeenCalledWith('Hello');
    });

    it('should return SSE stream if stream is true', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { content: 'Chunk 1', response_metadata: {} };
          yield { content: 'Chunk 2', response_metadata: {} };
        },
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      vi.mocked(OpenAi.stream).mockResolvedValue(mockStream);

      const response = await request(app).post('/ask').send({ prompt: 'Hello', stream: true });

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toContain('text/event-stream');
      expect(response.text).toContain('data: {"content":"Chunk 1","metadata":{}}');
      expect(response.text).toContain('data: {"content":"Chunk 2","metadata":{}}');
      expect(response.text).toContain('event: end');
      expect(OpenAi.stream).toHaveBeenCalledWith('Hello');
    });

    it('should return 400 if prompt is missing (unhappy flow)', async () => {
      const response = await request(app).post('/ask').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'prompt cannot be empty' });
      expect(OpenAi.ask).not.toHaveBeenCalled();
    });

    it('should return 500 if AI model throws an error (unhappy flow)', async () => {
      const errorMessage = 'AI Service Unavailable';
      vi.mocked(OpenAi.ask).mockRejectedValue(new Error(errorMessage));

      const response = await request(app).post('/ask').send({ prompt: 'Hello' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'AI Error',
        details: errorMessage,
      });
    });
  });
});
