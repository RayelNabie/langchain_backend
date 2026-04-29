import { Router } from 'express';
import type { Request, Response } from 'express';
import { OpenaiController } from '#Http/Controllers/OpenaiController.js';

const router: Router = Router();

/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Controleert of de basis-API in de lucht is.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Succesvolle begroeting
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "Hello World!"
 */
router.get('/', (req: Request, res: Response): void => {
  res.send('Hello World!');
});

/**
 * @openapi
 * /ask:
 *   post:
 *     summary: Stel een vraag aan het AI model
 *     description: Stuurt een prompt naar Azure OpenAI via LangChain en retourneert het antwoord inclusief metadata (zoals token usage).
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
 *                 example: "Leg in 2 zinnen uit wat het Bouncer Pattern is."
 *     responses:
 *       200:
 *         description: Succesvol antwoord gegenereerd
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   example: "Het Bouncer Pattern is een programmeerstijl..."
 *                 metadata:
 *                   type: object
 *                   description: Ruwe metadata van de LLM provider
 *       400:
 *         description: Bad Request (Prompt ontbreekt in de body)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Prompt is verplicht"
 *       500:
 *         description: Internal Server Error (AI API plat of netwerkfout)
 */
router.post('/ask', OpenaiController.ask);

export default router;
