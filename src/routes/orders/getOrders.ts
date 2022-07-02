import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { getDocs, query, QueryConstraint, where } from 'firebase/firestore';
import {
  AvailableBankSchema,
  AvailablePaymentMethodSchema,
  DefaultResponse400Schema,
  StatusPemesanan,
} from 'src/common/schema';
import {
  CustomRouteHandler,
  HandlerGeneric,
  ObjectSchemaToType,
  ResponseSchema,
} from 'src/common/types';
import { createResponseSchema } from 'src/common/util';
import orderUtils from 'src/routes/orders/orderUtils';

const getOrdersQuerySchema = Type.Object({
  bank: Type.Optional(AvailableBankSchema),
  payment_method: Type.Optional(AvailablePaymentMethodSchema),
  status: Type.Optional(StatusPemesanan),
  fromDate: Type.Optional(
    Type.Number({
      description: 'timestamp awal periode',
      examples: ['1652521028791'],
      default: 0,
    })
  ),
  toDate: Type.Optional(
    Type.Number({
      description: 'timestamp akhir periode',
      examples: ['1652521028791'],
      default: Number.POSITIVE_INFINITY,
    })
  ),
});

const getOrdersResponseSchema = createResponseSchema({
  200: Type.Array(
    Type.Object({
      id: Type.String({ description: 'Id of the orders' }),
      bank: AvailableBankSchema,
      no_vc: Type.String({
        description: 'Nomor Virtual Account yang dapat digunakan',
      }),
      payment_method: AvailablePaymentMethodSchema,
      status: StatusPemesanan,
      time: Type.Number({ description: 'Waktu pemesanan' }),
      user_id: Type.String({ description: 'ID User pemesan' }),
      checkout_items: Type.Array(
        Type.Object(
          {
            amount: Type.Number({ description: 'Banyak Item' }),
            item_id: Type.String({ description: 'Id produk' }),
          },
          {
            description: 'Produk-produk yang di checkout',
          }
        )
      ),
    }),
    {
      description: 'Success',
    }
  ),
  400: DefaultResponse400Schema,
});

export type GetOrdersSchema = HandlerGeneric<{
  Querystring: ObjectSchemaToType<typeof getOrdersQuerySchema>;
  Reply: ResponseSchema<typeof getOrdersResponseSchema>;
}>;

export const getOrdersSchema: FastifySchema = {
  description: 'Mengambil list pesanan',
  tags: ['Orders'],
  response: getOrdersResponseSchema,
  querystring: getOrdersQuerySchema,
};

export const getOrders: CustomRouteHandler<GetOrdersSchema> = async function (
  req,
  res
) {
  const qcs: QueryConstraint[] = [];

  const rq = req.query;
  const equalizables: Exclude<keyof typeof req.query, 'toDate' | 'fromDate'>[] =
    ['bank', 'payment_method', 'status'];

  Object.keys(rq).forEach((k) => {
    const _rq = rq as any;

    if (_rq[k] && k in equalizables) {
      qcs.push(where(k, '==', _rq[k]));
    }
  });

  if (rq.fromDate) {
    qcs.push(where('time', '>=', rq.fromDate));
  }

  if (rq.toDate) {
    qcs.push(where('time', '<=', rq.toDate));
  }

  const snapshot = await getDocs(query(orderUtils.colRef, ...qcs));

  if (snapshot.empty) return res.status(200).send([]);

  const datas = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.status(200).send(datas as any);
};
