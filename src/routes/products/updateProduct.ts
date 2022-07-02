import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { getDoc, updateDoc } from 'firebase/firestore';
import {
  AvailableKategoriProduct,
  DefaultResponse204Schema,
  DefaultResponse400Schema,
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

const updateProductParamsSchema = Type.Object({
  id: Type.String({ description: 'Id produk yang ingin di update' }),
});

const updateProductBodySchema = Type.Object({
  category: Type.Optional(AvailableKategoriProduct),
  deskripsi: Type.Optional(
    Type.String({
      description: 'Deskripsi produk',
      examples: ['Biji kapulaga merupakan...'],
    })
  ),
  harga: Type.Optional(
    Type.Number({
      description: 'Harga produk',
      examples: [25000],
    })
  ),
  nama: Type.Optional(
    Type.String({
      description: 'Nama produk',
      examples: ['Biji Kapulaga'],
    })
  ),
  photo_name: Type.Optional(
    Type.String({
      description: 'Nama foto produk',
      examples: ['kapulaga_biji.jpeg'],
    })
  ),
  promo: Type.Optional(
    Type.Number({
      description: 'Potongan harga/diskon (bentuk pecahan)',
      examples: [0.4, 0.2],
      default: 0,
    })
  ),
});

const updateProductResponseSchemas = createResponseSchema({
  204: DefaultResponse204Schema,
  404: DefaultResponse404Schema,
  400: DefaultResponse400Schema,
});

export type UpdateProductSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof updateProductParamsSchema>;
  Body: ObjectSchemaToType<typeof updateProductBodySchema>;
  Reply: ResponseSchema<typeof updateProductResponseSchemas>;
}>;

export const updateProductSchema: FastifySchema = {
  description: 'Mengupdate produk berdasarkan Id',
  tags: ['Products'],
  params: updateProductParamsSchema,
  body: updateProductBodySchema,
  response: updateProductResponseSchemas,
};

export const updateProduct: CustomRouteHandler<UpdateProductSchema> =
  async function (req, res) {
    const docRef = productUtils.docRef(req.params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      this.log.info(`Produk ${req.params.id} tidak ditemukan`);
      return res.callNotFound();
    }

    return await updateDoc(docRef, req.body)
      .then(() => {
        this.log.info(`Produk ${req.params.id} berhasil di update`);

        return res.code(204).send();
      })
      .catch((err) => {
        this.log.info(`Produk ${req.params.id} gagal di update`);
        this.log.trace(err);

        return res.code(500).send();
      });
  };
