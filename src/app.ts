import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import { fastify } from 'fastify';

import { onReady } from 'src/appHooks';
import { appConfig, corsConfig, swaggerConfig } from 'src/configs';
import { adminRoutes } from 'src/routes';

const app = fastify(appConfig);

/**
 * register plugin
 */
app.register(fastifyCors, corsConfig);
app.register(fastifySwagger, swaggerConfig);

/**
 * register routes
 */
app.register(adminRoutes, { prefix: '/admins' });

/**
 * register hooks
 */
app.addHook('onReady', onReady);

export default app;
