import type { SwaggerOptions } from '@fastify/swagger';

export const swaggerConfig: SwaggerOptions = {
  routePrefix: '/',
  openapi: {
    info: {
      title: 'Pujasari-Backend',
      version: '0.1.0',
      description: 'Aplikasi backend untuk pujasari',
    },
  },
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },

  exposeRoute: true,
};
