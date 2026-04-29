import swaggerJsdoc from 'swagger-jsdoc';
import { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Langchain backend',
      version: '1.0.0',
      description: 'API Documentation voor de Express applicatie',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local dev environment',
      },
    ],
  },

  apis: ['./src/Routes/*.ts', './src/app.ts'],
};

const swaggerSpec: object = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/api-docs.json', (req: Request, res: Response): void => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('[Swagger] Documentatie is live op http://localhost:3000/api-docs');
};
