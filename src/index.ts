import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import { fastify } from 'fastify';
import ordersRoutes from './routes/orders';
import productsRoutes from './routes/products';

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

app.listen(port, (_err, addr) => {
  console.log(`running on ${addr}`);
});
