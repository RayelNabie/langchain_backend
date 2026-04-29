import express from 'express';
import type { Express } from 'express';
import { setupSwagger } from '#Config/swagger.js';
import appRouter from '#Routes/web.js';
import { validateConfig } from '#Utils/configValidator.js';
import { connectDatabase } from '#Utils/database.js';

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
    validateConfig();

    await connectDatabase();

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

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export default app;
