/**
 * @file Builds the OpenAPI specification used to generate the Swagger
 *       documentation.
 *
 * @module Http/Documentation/spec
 * @author RayelNabie
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Langchain backend',
      version: '1.0.0',
      description: 'API Documentation for FootballAI',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local dev environment',
      },
    ],
  },

  apis: ['./src/Http/**/*.ts', './src/app.ts'],
};

export const swaggerSpec: object = swaggerJsdoc(options);
