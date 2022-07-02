import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { getDoc } from 'firebase/firestore';
import {
  AvailableKategoriProduct,
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

const getProductParamsSchema = Type.Object({
  id: Type.String({ description: 'Id produk' }),
});

const getProductResponseSchemas = createResponseSchema({
  200: Type.Object({
    id: Type.String({ description: 'Id produk' }),
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
    promo: Type.Number({
      description: 'Potongan harga/diskon (bentuk pecahan)',
      examples: ['0.4', '0.4'],
    }),
  }),

  404: DefaultResponse404Schema,
});

export type GetProductSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof getProductParamsSchema>;
  Reply: ResponseSchema<typeof getProductResponseSchemas>;
}>;

export const getProductSchema: FastifySchema = {
  description: 'Mengambil produk berdasarkan id',
  tags: ['Products'],
  params: getProductParamsSchema,
  response: getProductResponseSchemas,
};

export const getProduct: CustomRouteHandler<GetProductSchema> = async function (
  req,
  res
) {
  const docRef = productUtils.docRef(req.params.id);
  const docSnap = await getDoc(docRef).then((v) => {
    this.log.info(`Produk ${v.id} ditemukan`);

    return v;
  });

  if (!docSnap.exists()) {
    this.log.info(`Produk ${req.params.id} tidak ditemukan`);

    return res.callNotFound();
  }

  return res.code(200).send({
    id: docSnap.id,
    ...docSnap.data(),
  } as any);
};
