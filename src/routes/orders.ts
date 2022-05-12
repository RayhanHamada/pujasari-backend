import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import {
  AvailableBankSchema,
  AvailablePaymentMethodSchema,
  StatusPemesanan,
} from '~src/common/schema';
import { ObjectSchemaToType, ResponseSchema } from '~src/common/types';
import { createResponseSchema } from '~src/common/util';

const ordersRoutes: FastifyPluginAsync = async (fastify, _) => {
  /**
   * get orders
   */
  const getOrdersQuerySchema = Type.Object({
    bank: Type.Optional(AvailableBankSchema),
    no_vc: Type.Optional(
      Type.String({
        description: 'Nomor Virtual Account yang dapat digunakan',
      })
    ),
    payment_method: Type.Optional(AvailablePaymentMethodSchema),
    status: Type.Optional(StatusPemesanan),
    user_id: Type.Optional(Type.String({ description: 'ID User pemesan' })),
  });

  const getOrdersResponseSchema = createResponseSchema({
    200: Type.Array(
      Type.Object({
        bank: AvailableBankSchema,
        no_vc: Type.String({
          description: 'Nomor Virtual Account yang dapat digunakan',
        }),
        payment_method: AvailablePaymentMethodSchema,
        status: StatusPemesanan,
        time: Type.Number({ description: 'Waktu pemesanan' }),
        user_id: Type.String({ description: 'ID User pemesan' }),
      }),
      {
        description: 'Success',
      }
    ),
  });

  fastify.get<{
    Reply: ResponseSchema<typeof getOrdersResponseSchema>;
    Querystring: ObjectSchemaToType<typeof getOrdersQuerySchema>;
  }>(
    '',
    {
      schema: {
        description: 'Mengambil list pesanan',
        response: getOrdersResponseSchema,
        querystring: getOrdersQuerySchema,
      },
    },
    (req, res) => {
      // TODO: implement
    }
  );

  /**
   * get an order
   */
  const getOrderByIdParamsSchema = Type.Object({
    id: Type.String({ description: 'Id pesanan' }),
  });

  const getOrderByIdResponseSchema = createResponseSchema({
    200: Type.Object(
      {
        bank: AvailableBankSchema,
        no_vc: Type.String({
          description: 'Nomor Virtual Account yang dapat digunakan',
        }),
        payment_method: AvailablePaymentMethodSchema,
        status: StatusPemesanan,
        time: Type.Number({ description: 'Waktu pemesanan' }),
        user_id: Type.String({ description: 'ID User pemesan' }),
      },
      {
        description: 'Success',
      }
    ),
  });

  fastify.get<{
    Reply: ResponseSchema<typeof getOrderByIdResponseSchema>;
    Params: ObjectSchemaToType<typeof getOrderByIdParamsSchema>;
  }>(
    '/:id',
    {
      schema: {
        description: 'Mengambil Pesanan',
        response: getOrderByIdResponseSchema,
        params: getOrderByIdParamsSchema,
      },
    },
    (req, res) => {
      // TODO: implement
      if (req.params.id) {
        console.log(req.params.id);

        res.send();
      }
    }
  );

  /**
   * Mengupdate pesanan
   */
  const updateOrderByIdParamSchema = Type.Object({
    id: Type.String({ description: 'Id pesanan' }),
  });

  const updateOrderByIdBody = Type.Object({
    bank: Type.Optional(AvailableBankSchema),
    no_vc: Type.Optional(
      Type.String({
        description: 'Nomor Virtual Account yang dapat digunakan',
      })
    ),
    payment_method: Type.Optional(AvailablePaymentMethodSchema),
    status: Type.Optional(StatusPemesanan),
    user_id: Type.Optional(Type.String({ description: 'ID User pemesan' })),
  });

  const updateOrderByIdResponseSchema = createResponseSchema({
    204: Type.Object(
      {},
      {
        description: 'Success. No Content',
      }
    ),
  });

  fastify.put<{
    Params: ObjectSchemaToType<typeof updateOrderByIdParamSchema>;
    Body: ObjectSchemaToType<typeof updateOrderByIdBody>;
    Reply: ResponseSchema<typeof updateOrderByIdResponseSchema>;
  }>(
    '',
    {
      schema: {
        description: 'Mengupdate data pesanan',
        params: updateOrderByIdParamSchema,
        body: updateOrderByIdBody,
        response: updateOrderByIdResponseSchema,
      },
    },
    (req, res) => {
      // TODO: implement
    }
  );
};

export default ordersRoutes;
