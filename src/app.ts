import express from 'express';
import type { Express } from 'express';
import { setupSwagger } from '#Config/swagger.js';
import appRouter from '#Routes/web.js';
import { validateConfig } from '#Utils/configValidator.js';
import { connectDatabase } from '#Utils/database.js';
import { IncomingMessage, ServerResponse } from 'node:http';
import * as http from 'node:http';

const app: Express = express();
const port: string | 3000 = process.env.PORT || 3000;

/** Middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** Routes */
setupSwagger(app);
app.use('/', appRouter);

const bootstrap: () => Promise<void> = async (): Promise<void> => {
  try {
    console.log('[Bootstrap] Validating config...');
    validateConfig();

    console.log('[Bootstrap] Connecting to database...');
    await connectDatabase();

    /** Start server */
    console.log(`[Bootstrap] Starting server on port ${port}...`);
    const server: http.Server<typeof IncomingMessage, typeof ServerResponse> = app.listen(
      port,
      (): void => {
        console.log(`[Server] Application is live on http://localhost:${port}`);
      },
    );

    server.on('error', (err: Error) => {
      console.error(`[Server] Server error: ${err.message}`);
      console.error(err.stack);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`[Fatal] Server startup failed: ${err.message}`);
      console.error(err.stack);
    } else {
      console.error(`[Fatal] Server startup failed with an unknown error:`, err);
    }

    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export default app;
