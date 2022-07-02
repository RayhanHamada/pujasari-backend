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
import productUtils from 'src/routes/products/productUtils';

const deleteProductParamsSchema = Type.Object({
  id: Type.String({ description: 'Id produk yang ingin dihapus' }),
});

const deleteProductResponseSchemas = createResponseSchema({
  204: DefaultResponse204Schema,
  404: DefaultResponse404Schema,
});

export type DeleteProductSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof deleteProductParamsSchema>;
  Reply: ResponseSchema<typeof deleteProductResponseSchemas>;
}>;

export const deleteProductSchema: FastifySchema = {
  description: 'Menghapus produk berdasarkan Id',
  tags: ['Products'],
  params: deleteProductParamsSchema,
  response: deleteProductResponseSchemas,
};

export const deleteProduct: CustomRouteHandler<DeleteProductSchema> =
  async function (req, res) {
    const docRef = productUtils.docRef(req.params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      this.log.info(`Produk ${req.params.id} tidak ditemukan`);

      return res.callNotFound();
    }

    return await deleteDoc(docRef)
      .then(() => {
        this.log.info(`Produk ${req.params.id} berhasil dihapus`);

        return res.code(204).send();
      })
      .catch((err) => {
        this.log.info(`Produk ${req.params.id} gagal dihapus`);
        this.log.trace(err);

        return res.code(500).send();
      });
  };
