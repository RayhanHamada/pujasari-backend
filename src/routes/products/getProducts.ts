import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { getDocs, query, QueryConstraint, where } from 'firebase/firestore';
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

const getProductsQuerySchema = Type.Object({
  category: Type.Optional(AvailableKategoriProduct),
  hargaMulai: Type.Optional(
    Type.Number({
      description: 'Filter harga mulai',
      examples: [5000, 10000],
      default: 0,
    })
  ),
  hargaHingga: Type.Optional(
    Type.Number({
      description: 'Filter harga mulai',
      examples: [20000, 30000],
      default: Number.POSITIVE_INFINITY,
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

const getProductsResponseSchemas = createResponseSchema({
  200: Type.Array(
    Type.Object({
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
        examples: [0.4, 0.2],
      }),
    })
  ),

  400: DefaultResponse400Schema,
});

export type GetProductsSchema = HandlerGeneric<{
  Querystring: ObjectSchemaToType<typeof getProductsQuerySchema>;
  Reply: ResponseSchema<typeof getProductsResponseSchemas>;
}>;

export const getProductsSchema: FastifySchema = {
  description: 'Mengambil list produk',
  tags: ['Products'],
  querystring: getProductsQuerySchema,
  response: getProductsResponseSchemas,
};

export const getProducts: CustomRouteHandler<GetProductsSchema> =
  async function (req, res) {
    const queries: QueryConstraint[] = [];
    const rq = req.query;

    if (rq.category) {
      queries.push(where('category', '==', rq.category));
    }

    if (rq.hargaMulai) {
      queries.push(where('harga', '>=', rq.hargaMulai));
    }

    if (rq.hargaHingga) {
      queries.push(where('harga', '>=', rq.hargaHingga));
    }

    if (rq.promo) {
      queries.push(where('promo', '==', rq.promo));
    }

    const queried = query(productUtils.colRef, ...queries);

    const docs = await getDocs(queried).then((v) => {
      this.log.info(`Berhasil mengambil ${v.size} produk`);

      return v;
    });

    if (docs.empty) {
      return res.code(200).send([]);
    }

    const fetchedProducts = docs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    return res.code(200).send(fetchedProducts);
  };
