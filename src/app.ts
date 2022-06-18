import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import { fastify } from 'fastify';

import { onReady } from 'src/appHooks';
import { appConfig, corsConfig, swaggerConfig } from 'src/configs';
import adminsRoutes from 'src/routes/admins';
import customersRoutes from 'src/routes/customers';
import ordersRoutes from 'src/routes/orders';
import productsRoutes from 'src/routes/products';
import recipesRoutes from 'src/routes/recipes';

const app = fastify(appConfig);

/**
 * register plugin
 */
app.register(fastifyCors, corsConfig);
app.register(fastifySwagger, swaggerConfig);

/**
 * register routes
 */
app.register(ordersRoutes, { prefix: '/orders' });
app.register(productsRoutes, { prefix: '/products' });
app.register(recipesRoutes, { prefix: '/recipes' });
app.register(customersRoutes, { prefix: '/customers' });
app.register(adminsRoutes, { prefix: '/admins' });

/**
 * register hooks
 */
app.addHook('onReady', onReady);

export default app;
