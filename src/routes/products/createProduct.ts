import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { addDoc } from 'firebase/firestore';
import {
  AvailableKategoriProduct,
  DefaultResponse400Schema,
} from 'src/common/schema';
import {
  CustomRouteHandler,
  HandlerGeneric,
  ObjectSchemaToType,
  ResponseSchema,
} from 'src/common/types';
import { createResponseSchema } from 'src/common/util';
import productUtils from 'src/routes/products/productUtils';

const createProductBodySchema = Type.Object({
  category: AvailableKategoriProduct,
  deskripsi: Type.String({
    description: 'Deskripsi produk',
    examples: ['Biji kapulaga merupakan...'],
  }),
  harga: Type.Number({
    description: 'Harga produk',
    examples: [25000],
  }),
  nama: Type.String({
    description: 'Nama produk',
    examples: ['Biji Kapulaga'],
  }),
  photo_name: Type.String({
    description: 'Nama foto produk',
    examples: ['kapulaga_biji.jpeg'],
  }),
  promo: Type.Optional(
    Type.Number({
      description: 'Potongan harga/diskon (bentuk pecahan)',
      examples: [0.4, 0.2],
      default: 0,
    })
  ),
});

const createProductResponseSchemas = createResponseSchema({
  200: Type.Object({
    id: Type.String({ description: 'Id produk yang ditambahkan' }),
  }),
  400: DefaultResponse400Schema,
});

export type CreateProductSchema = HandlerGeneric<{
  Body: ObjectSchemaToType<typeof createProductBodySchema>;
  Reply: ResponseSchema<typeof createProductResponseSchemas>;
}>;

export const createProductSchema: FastifySchema = {
  description: 'Membuat produk baru',
  tags: ['Products'],
  body: createProductBodySchema,
  response: createProductResponseSchemas,
};

export const createProduct: CustomRouteHandler<CreateProductSchema> =
  async function (req, res) {
    const id = await addDoc(productUtils.colRef, req.body)
      .then((v) => {
        this.log.info(`Produk ${v.id} sukses dibuat`);

        return v.id;
      })
      .catch((err) => {
        this.log.error(`Gagal membuat produk`);
        this.log.trace(err);

        return undefined;
      });

    if (!id) {
      return res.code(500).send();
    }

    return res.code(200).send({ id });
  };
