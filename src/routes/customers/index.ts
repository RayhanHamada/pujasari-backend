import type { FastifyPluginAsync } from 'fastify';
import {
  getCustomer,
  getCustomerSchema,
  GetCustomerSchema,
} from 'src/routes/customers/getCustomer';
import {
  getCustomers,
  getCustomersSchema,
  GetCustomersSchema,
} from 'src/routes/customers/getCustomers';

export const customerRoutes: FastifyPluginAsync = async function (app, _) {
  app.get<GetCustomersSchema>(
    '',
    {
      schema: getCustomersSchema,
    },
    getCustomers
  );

  app.get<GetCustomerSchema>(
    '/:id',
    {
      schema: getCustomerSchema,
    },
    getCustomer
  );
};
