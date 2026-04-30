import { Request, Response } from 'express';
import OpenAi from '#Models/Openai.js';
import type OpenaiResponse from '#Types/OpenaiResponse.js';
import type AskRequest from '#Types/AskRequest.js';

export class OpenaiController {
  /**
   * Handles the /ask requests
   */
  public static async ask(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, stream }: AskRequest = req.body;

      if (!prompt) {
        res.status(400).json({ error: 'prompt cannot be empty' });
        return;
      }

      if (stream) {
        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const streamResponse = await OpenAi.stream(prompt);

        for await (const chunk of streamResponse) {
          const data: string = JSON.stringify({
            content: chunk.content,
            metadata: chunk.response_metadata,
          });
          res.write(`data: ${data}\n\n`);
        }

        res.write('event: end\ndata: [DONE]\n\n');
        res.end();
        return;
      }

      const result: OpenaiResponse = await OpenAi.ask(prompt);

      res.json(result);
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);

      // If headers are already sent, we can't send a JSON error response
      if (res.headersSent) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
        res.end();
        return;
      }

      res.status(500).json({ error: 'AI Error', details: message });
    }
  }
}
