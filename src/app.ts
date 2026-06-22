/**
 * @file Application entry point. Configures the Express app, registers
 *       middleware and Swagger, and starts the HTTP server after validating
 *       configuration and establishing the database connection.
 * @module server
 * @author RayelNabie
 */

import 'dotenv/config';
import express from 'express';
import type { Express } from 'express';
import type { Server } from 'node:http';
import { setupSwagger } from '#Config/swagger.js';
import appRouter from '#Routes/web.js';
import { validateConfig } from '#Utils/configValidator.js';
import { connectDatabase } from '#Utils/database.js';

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);
app.use('/', appRouter);

const bootstrap = async (): Promise<void> => {
  try {
    validateConfig();
    await connectDatabase();
    const server: Server = app.listen(port, (err?: Error): void => {
      if (err) {
        console.error(`Failed to start: ${err.message}`);
        process.exit(1);
      }
    });

    server.on('error', (err: Error): void => {
      console.error(`Server error: ${err.message}`);
      console.error(err.stack);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.stack);
    } else {
      console.error('Server startup failed with an unknown error:', err);
    }
    process.exit(1);
  }
};

// Skip auto-start under test so Vitest can import the app.
if (process.env.NODE_ENV !== 'test') {
  void bootstrap();
}

export default app;
