import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { getDoc } from 'firebase/firestore';
import {
  AvailableBankSchema,
  AvailablePaymentMethodSchema,
  DefaultResponse404Schema,
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

const getOrderByIdParamsSchema = Type.Object({
  id: Type.String({ description: 'Id pesanan' }),
});

const getOrderByIdResponseSchema = createResponseSchema({
  200: Type.Object(
    {
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
    },
    {
      description: 'Success',
    }
  ),

  404: DefaultResponse404Schema,
});

export type GetOrderSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof getOrderByIdParamsSchema>;
  Reply: ResponseSchema<typeof getOrderByIdResponseSchema>;
}>;

export const getOrderSchema: FastifySchema = {
  description: 'Mengambil Pesanan',
  tags: ['Orders'],
  response: getOrderByIdResponseSchema,
  params: getOrderByIdParamsSchema,
};

export const getOrder: CustomRouteHandler<GetOrderSchema> = async function (
  req,
  res
) {
  const docRef = orderUtils.docRef(req.params.id);
  const docSnap = await getDoc(docRef).then((v) => {
    this.log.info(`Berhasil mengambil order ${v.id}`);

    return v;
  });

  if (!docSnap.exists()) {
    return res.callNotFound();
  }

  return res.status(200).send({
    id: docSnap.id,
    ...docSnap.data(),
  } as any);
};
