import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import { fastify } from 'fastify';
import customersRoutes from './routes/customers';
import ordersRoutes from './routes/orders';
import productsRoutes from './routes/products';
import recipesRoutes from './routes/recipes';

const app = fastify({ logger: true });
const port = process.env.PORT || 4000;

app.register(fastifyCors);

app.register(fastifySwagger, {
  routePrefix: '/docs',
  openapi: {
    info: {
      title: 'Pujasari-Backend',
      version: '0.1.0',
    },
  },
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },

  exposeRoute: true,
});

app.register(ordersRoutes, { prefix: '/orders' });
app.register(productsRoutes, { prefix: '/products' });
app.register(recipesRoutes, { prefix: '/recipes' });
app.register(customersRoutes, { prefix: '/customers' });

app.listen(
  port,
  process.env.NODE_ENV === 'production'
    ? process.env.HOST || '0.0.0.0'
    : 'localhost',
  (_err, addr) => {
    console.log(`server running on ${addr}:${port}`);
  }
);
