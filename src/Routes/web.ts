import { Router } from 'express';
import type { Request, Response } from 'express';
import openaiRoutes from '#Routes/openai.routes.js';

const appRouter: Router = Router();

/**
 * Register specific routes
 */
appRouter.use('/', openaiRoutes);

/**
 * Fallback for non-existent routes
 */
appRouter.use((req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
});

export default appRouter;
