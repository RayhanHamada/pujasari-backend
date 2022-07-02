import type { FastifyPluginAsync } from 'fastify';
import { deleteOrder, deleteOrderSchema } from 'src/routes/orders/deleteOrder';
import {
  getOrder,
  getOrderSchema,
  GetOrderSchema,
} from 'src/routes/orders/getOrder';
import {
  getOrders,
  getOrdersSchema,
  GetOrdersSchema,
} from 'src/routes/orders/getOrders';
import { updateOrder, updateOrderSchema } from 'src/routes/orders/updateOrder';

export const orderRoutes: FastifyPluginAsync = async function (app, _) {
  app.get<GetOrdersSchema>(
    '',
    {
      schema: getOrdersSchema,
    },
    getOrders
  );

  app.get<GetOrderSchema>(
    '/:id',
    {
      schema: getOrderSchema,
    },
    getOrder
  );

  app.put(
    '/:id',
    {
      schema: updateOrderSchema,
    },
    updateOrder
  );

  app.delete(
    '/:id',
    {
      schema: deleteOrderSchema,
    },
    deleteOrder
  );
};
