import { Router } from 'express';
import { OpenaiController } from '#Http/Controllers/OpenaiController.js';

const router: Router = Router();

/**
 * @openapi
 * /ask:
 *   post:
 *     summary: Ask the OpenAI LLM a question
 *     description: Sends a prompt to Azure OpenAI via LangChain and returns the response including metadata (such as token usage).
 *     tags:
 *       - AI Integration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Explain in 2 sentences what the Bouncer Pattern is."
 *               stream:
 *                 type: boolean
 *                 description: Whether to stream the response using Server-Sent Events
 *                 example: false
 *     responses:
 *       200:
 *         description: Successfully generated response (JSON or Event Stream)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   example: "The Bouncer Pattern is a programming style..."
 *                 metadata:
 *                   type: object
 *                   description: Raw metadata from the LLM provider
 *       400:
 *         description: Bad Request (Prompt missing in the body)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Prompt is required"
 *       500:
 *         description: Internal Server Error (AI API down or network error)
 */
router.post('/ask', OpenaiController.ask);

export default router;
