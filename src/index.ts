import { fastify } from 'fastify';

const app = fastify({ logger: true });

const port = process.env.PORT || 3000;

app.listen(port, (_err, addr) => {
  console.log(`running on ${addr}`);
});
