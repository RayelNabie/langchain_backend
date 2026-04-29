import express from 'express';
import type { Express } from 'express';
import { setupSwagger } from '#Config/swagger.js';
import webRoutes from '#Routes/web.js';
import { validateConfig } from '#Utils/configValidator.js';
import { connectDatabase } from '#Utils/database.js';

const app: Express = express();
const port: string | 3000 = process.env.PORT || 3000;

const bootstrap: () => Promise<void> = async (): Promise<void> => {
  try {
    validateConfig();

    await connectDatabase();

    /** Middlewares */
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    setupSwagger(app);

    /** Routes */
    app.use('/', webRoutes);

    /** Start server */
    app.listen(port, (): void => {
      console.log(`[Server] Application is live on http://localhost:${port}`);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`[Fatal] Server startup failed: ${err.message}`);
    } else {
      console.error(`[Fatal] Server startup failed with an unknown error: ${String(err)}`);
    }

    process.exit(1);
  }
};

bootstrap();
