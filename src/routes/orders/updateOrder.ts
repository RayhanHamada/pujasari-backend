import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { getDoc, updateDoc } from 'firebase/firestore';
import {
  DefaultResponse204Schema,
  DefaultResponse400Schema,
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

/**
 * Mengupdate pesanan
 */
const updateOrderByIdParamSchema = Type.Object({
  id: Type.String({ description: 'Id pesanan' }),
});

const updateOrderByIdBody = Type.Object({
  status: Type.Optional(StatusPemesanan),
});

const updateOrderByIdResponseSchema = createResponseSchema({
  204: DefaultResponse204Schema,
  404: DefaultResponse404Schema,
  400: DefaultResponse400Schema,
});

export type UpdateOrderSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof updateOrderByIdParamSchema>;
  Body: ObjectSchemaToType<typeof updateOrderByIdBody>;
  Reply: ResponseSchema<typeof updateOrderByIdResponseSchema>;
}>;

export const updateOrderSchema: FastifySchema = {
  description: 'Mengupdate data pesanan (hanya status)',
  tags: ['Orders'],
  params: updateOrderByIdParamSchema,
  body: updateOrderByIdBody,
  response: updateOrderByIdResponseSchema,
};

export const updateOrder: CustomRouteHandler<UpdateOrderSchema> =
  async function (req, res) {
    const docRef = orderUtils.docRef(req.params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.callNotFound();
    }

    return await updateDoc(docRef, {
      ...req.body,
    })
      .then(() => {
        this.log.info(`Berhasil mengupdate orders ${req.params.id}`);

        return res.code(204).send();
      })
      .catch((err) => {
        this.log.error(`Gagal mengupdate orders ${req.params.id}`);
        this.log.trace(err);

        return res.code(500).send();
      });
  };
