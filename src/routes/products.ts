import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
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
      // TODO: implement
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
    (req, res) => {
      // TODO: implement
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
