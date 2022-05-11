import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import {
  AvailableBankSchema,
  AvailablePaymentMethodSchema,
  StatusPemesanan,
} from '~src/common/schema';

const ordersRoutes: FastifyPluginAsync = async (fastify, _) => {
  const listOrderQuerySchema = Type.Object({
    bank: AvailableBankSchema,
    no_vc: Type.String({
      description: 'Nomor Virtual Account yang dapat digunakan',
    }),
    payment_method: AvailablePaymentMethodSchema,
    status: StatusPemesanan,
    time: Type.Number({ description: 'Waktu pemesanan' }),
    user_id: Type.String({ description: 'ID User pemesan' }),
  });

  const listOrderResponseSchemas = {
    200: Type.Object({
      datas: Type.Array(
        Type.Object({
          bank: AvailableBankSchema,
          no_vc: Type.String({
            description: 'Nomor Virtual Account yang dapat digunakan',
          }),
          payment_method: AvailablePaymentMethodSchema,
          status: StatusPemesanan,
          time: Type.Number({ description: 'Waktu pemesanan' }),
          user_id: Type.String({ description: 'ID User pemesan' }),
        })
      ),
    }),
  };

  fastify.get<{
    Reply: Static<
      typeof listOrderResponseSchemas[keyof typeof listOrderResponseSchemas]
    >;
    Querystring: Static<typeof listOrderQuerySchema>;
  }>(
    '/',
    {
      schema: {
        description: 'Mengambil list pesanan',
        response: {
          200: listOrderResponseSchemas['200'],
        },
        querystring: listOrderQuerySchema,
      },
    },
    (req, res) => {}
  );
};

export default ordersRoutes;
