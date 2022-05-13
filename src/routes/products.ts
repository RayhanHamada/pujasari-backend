import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import {
  addDoc,
  collection,
  getDocs,
  query,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import db from '~src/common/db';
import {
  AvailableKategoriProduct,
  DefaultResponse204Schema,
  DefaultResponse400Schema,
  DefaultResponse404Schema,
} from '~src/common/schema';
import { ObjectSchemaToType, ResponseSchema } from '~src/common/types';
import { createResponseSchema } from '~src/common/util';

const productsRoutes: FastifyPluginAsync = async (fastify, _) => {
  /**
   * Membuat produk baru
   */
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

  type CreateProductBodySchema = ObjectSchemaToType<
    typeof createProductBodySchema
  >;

  const createProductResponseSchemas = createResponseSchema({
    200: Type.Object({
      id: Type.String({ description: 'Id produk yang ditambahkan' }),
    }),
    400: DefaultResponse400Schema,
  });

  type CreateProductResponseSchemas = ResponseSchema<
    typeof createProductResponseSchemas
  >;

  fastify.post<{
    Body: CreateProductBodySchema;
    Reply: CreateProductResponseSchemas;
  }>(
    '',
    {
      schema: {
        description: 'Create new product',
        body: createProductBodySchema,
        response: createProductResponseSchemas,
      },
    },
    async (req, res) => {
      try {
        const addedDoc = await addDoc(collection(db, 'products'), req.body);
        const id = addedDoc.id;

        res.code(200).send({ id });
      } catch (e) {
        res.code(500).send();
      }
    }
  );

  /**
   * Melihat list produk
   */
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

  type GetProductsQuerySchema = ObjectSchemaToType<
    typeof getProductsQuerySchema
  >;

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

  type GetProductsResponseSchemas = ResponseSchema<
    typeof getProductsResponseSchemas
  >;

  fastify.get<{
    Querystring: GetProductsQuerySchema;
    Reply: GetProductsResponseSchemas;
  }>(
    '',
    {
      schema: {
        querystring: getProductsQuerySchema,
        response: getProductsResponseSchemas,
      },
    },
    async (req, res) => {
      // TODO: implement

      try {
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

        const queried = query(collection(db, 'products'), ...queries);

        const docs = await getDocs(queried);

        if (docs.empty) {
          return res.code(200).send([]);
        }

        return res.code(200).send(
          docs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as any
        );
      } catch (e) {
        res.code(500).send();
      }
    }
  );

  /**
   * Melihat produk berdasarkan id
   */

  const getProductParamsSchema = Type.Object({
    id: Type.String({ description: 'Id produk' }),
  });

  type GetProductParamsSchema = ObjectSchemaToType<
    typeof getProductParamsSchema
  >;

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
        examples: [0.4, 0.2],
      }),
    }),

    404: DefaultResponse404Schema,
  });

  type GetProductResponseSchemas = ResponseSchema<
    typeof getProductResponseSchemas
  >;

  fastify.get<{
    Params: GetProductParamsSchema;
    Reply: GetProductResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        params: getProductParamsSchema,
        response: getProductResponseSchemas,
      },
    },
    async (req, res) => {
      // TODO: implement
    }
  );

  /**
   * update produk berdasarkan id
   */

  const updateProductParamsSchema = Type.Object({
    id: Type.String({ description: 'Id produk yang ingin di update' }),
  });

  type UpdateProductParamsSchema = ObjectSchemaToType<
    typeof updateProductParamsSchema
  >;

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

  type UpdateProductBodySchema = ObjectSchemaToType<
    typeof updateProductBodySchema
  >;

  const updateProductResponseSchemas = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
    400: DefaultResponse400Schema,
  });

  type UpdateProductResponseSchemas = ResponseSchema<
    typeof updateProductResponseSchemas
  >;

  fastify.put<{
    Params: UpdateProductParamsSchema;
    Body: UpdateProductBodySchema;
    Reply: UpdateProductResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        params: updateProductParamsSchema,
        body: updateProductBodySchema,
        response: updateProductResponseSchemas,
      },
    },
    async (req, res) => {
      // TODO: implement
    }
  );

  /**
   * Menghapus produk berdasarkan id
   */
  const deleteProductParamsSchema = Type.Object({
    id: Type.String({ description: 'Id produk yang ingin dihapus' }),
  });

  type DeleteProductParamsSchema = ObjectSchemaToType<
    typeof deleteProductParamsSchema
  >;

  const deleteProductResponseSchemas = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
  });

  type DeleteProductResponseSchemas = ResponseSchema<
    typeof deleteProductResponseSchemas
  >;

  fastify.delete<{
    Params: DeleteProductParamsSchema;
    Reply: DeleteProductResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        params: deleteProductParamsSchema,
        response: deleteProductResponseSchemas,
      },
    },
    async (req, res) => {
      // TODO: implement
    }
  );
};

export default productsRoutes;
