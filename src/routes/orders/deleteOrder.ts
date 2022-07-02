import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { deleteDoc, getDoc } from 'firebase/firestore';
import {
  DefaultResponse204Schema,
  DefaultResponse404Schema,
} from 'src/common/schema';
import {
  CustomRouteHandler,
  HandlerGeneric,
  ObjectSchemaToType,
  ResponseSchema,
} from 'src/common/types';
import { createResponseSchema } from 'src/common/util';
import orderUtils from 'src/routes/orders/orderUtils';

const deleteOrderByIdParamsSchema = Type.Object({
  id: Type.String({ description: 'Id pesanan' }),
});

const deleteOrderByIdResponseSchemas = createResponseSchema({
  204: DefaultResponse204Schema,
  404: DefaultResponse404Schema,
});

export type DeleteOrderSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof deleteOrderByIdParamsSchema>;
  Reply: ResponseSchema<typeof deleteOrderByIdResponseSchemas>;
}>;

export const deleteOrderSchema: FastifySchema = {
  description: 'Menghapus data pesanan',
  tags: ['Orders'],
  params: deleteOrderByIdParamsSchema,
  response: deleteOrderByIdResponseSchemas,
};

export const deleteOrder: CustomRouteHandler<DeleteOrderSchema> =
  async function (req, res) {
    const docRef = orderUtils.docRef(req.params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.callNotFound();
    }

    return await deleteDoc(docRef)
      .then(() => {
        this.log.info(`Berhasil menghapus order ${docSnap.id}`);

        return res.code(204).send();
      })
      .catch((err) => {
        this.log.error(`Berhasil menghapus order ${req.params.id}`);
        this.log.trace(err);

        return res.code(500).send();
      });
  };
