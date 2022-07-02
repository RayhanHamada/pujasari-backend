import type { FastifyPluginAsync } from 'fastify';
import {
  createCustomer,
  CreateCustomerSchema,
  createCustomerSchema,
} from 'src/routes/customers/createCustomer';
import {
  deleteCustomer,
  DeleteCustomerSchema,
  deleteCustomerSchema,
} from 'src/routes/customers/deleteCustomer';
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
import {
  updateCustomer,
  updateCustomerSchema,
  UpdateCustomerSchema,
} from 'src/routes/customers/updateCustomer';

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

  app.post<CreateCustomerSchema>(
    '',
    {
      schema: createCustomerSchema,
    },
    createCustomer
  );

  app.put<UpdateCustomerSchema>(
    '/:id',
    {
      schema: updateCustomerSchema,
    },
    updateCustomer
  );

  app.delete<DeleteCustomerSchema>(
    '/:id',
    {
      schema: deleteCustomerSchema,
    },
    deleteCustomer
  );
};
