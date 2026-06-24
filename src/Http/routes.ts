/**
 * @file Aggregates all application routes and provides the 404 fallback.
 *
 * @module Http/routes
 * @author RayelNabie
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import chatRoutes from '#Http/Chat/routes.js';
import swaggerRoutes from '#Http/Documentation/routes.js';

const appRouter: Router = Router();

appRouter.use('/', chatRoutes);
appRouter.use('/', swaggerRoutes);

/**
 * Fallback for non-existent routes
 */
appRouter.use((req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
});

export default appRouter;
