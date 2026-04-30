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
      const { prompt }: AskRequest = req.body;

      if (!prompt) {
        res.status(400).json({ error: 'prompt cannot be empty' });
        return;
      }

      const result: OpenaiResponse = await OpenAi.ask(prompt);

      res.json(result);
    } catch (error: unknown) {
      const message: string = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: 'AI Error', details: message });
    }
  }
}
