import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import {
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
  updateDoc,
} from 'firebase/firestore';
import {
  DefaultResponse204Schema,
  DefaultResponse400Schema,
  DefaultResponse404Schema,
} from 'src/common/schema';
import { ObjectSchemaToType, ResponseSchema } from 'src/common/types';
import {
  createCollectionRef,
  createDocRefFetcher,
  createResponseSchema,
} from 'src/common/util';

const collectionName = 'resep';
const colRef = createCollectionRef(collectionName);
const getDocRef = createDocRefFetcher(collectionName);

const recipesRoutes: FastifyPluginAsync = async (fastify, _) => {
  /**
   * Membuat resep baru
   */
  const createRecipeBodySchema = Type.Object({
    nama: Type.String({
      description: 'Nama resep',
      examples: ['Opor Ayam', 'Sayur Sop'],
    }),
    bahan: Type.Array(Type.String(), {
      description: 'Bahan-bahan resep',
      examples: ['2 Cabe Merah', '1 Lengkuas (dihaluskan)'],
    }),
    langkah: Type.Array(Type.String(), {
      description: 'Langkah-langkah dalam membuat resep',
    }),
  });

  type CreateRecipeBodySchema = ObjectSchemaToType<
    typeof createRecipeBodySchema
  >;

  const createRecipeResponseSchemas = createResponseSchema({
    200: Type.Object({
      id: Type.String({ description: 'Id resep yang ditambahkan' }),
    }),
    400: DefaultResponse400Schema,
  });

  type CreateRecipeResponseSchemas = ResponseSchema<
    typeof createRecipeResponseSchemas
  >;

  fastify.post<{
    Body: CreateRecipeBodySchema;
    Reply: CreateRecipeResponseSchemas;
  }>(
    '',
    {
      schema: {
        description: 'Membuat resep baru',
        body: createRecipeBodySchema,
        response: createRecipeResponseSchemas,
      },
    },
    async (req, res) => {
      try {
        const addedDoc = await addDoc(colRef, req.body);
        const id = addedDoc.id;

        res.code(200).send({ id });
      } catch (e) {
        res.code(500).send();
      }
    }
  );

  /**
   * Melihat list resep
   */

  const getRecipesQuerySchema = Type.Object({});

  type GetRecipesQuerySchema = ObjectSchemaToType<typeof getRecipesQuerySchema>;

  const getRecipesResponseSchemas = createResponseSchema({
    200: Type.Array(
      Type.Object({
        id: Type.String({ description: 'Id resep' }),
        nama: Type.String({
          description: 'Nama resep',
          examples: ['Opor Ayam', 'Sayur Sop'],
        }),
        bahan: Type.Array(Type.String(), {
          description: 'Bahan-bahan resep',
          examples: ['2 Cabe Merah', '1 Lengkuas (dihaluskan)'],
        }),
        langkah: Type.Array(Type.String(), {
          description: 'Langkah-langkah dalam membuat resep',
        }),
      })
    ),

    400: DefaultResponse400Schema,
  });

  type GetRecipesResponseSchemas = ResponseSchema<
    typeof getRecipesResponseSchemas
  >;

  fastify.get<{
    Querystring: GetRecipesQuerySchema;
    Reply: GetRecipesResponseSchemas;
  }>(
    '',
    {
      schema: {
        description: 'Mengambil list resep',
        querystring: getRecipesQuerySchema,
        response: getRecipesResponseSchemas,
      },
    },
    async (_req, res) => {
      try {
        const queries: QueryConstraint[] = [];
        const queried = query(colRef, ...queries);
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
   * Melihat resep berdasarkan id
   */

  const getRecipeParamsSchema = Type.Object({
    id: Type.String({ description: 'Id resep' }),
  });

  type GetRecipeParamsSchema = ObjectSchemaToType<typeof getRecipeParamsSchema>;

  const getRecipeResponseSchemas = createResponseSchema({
    200: Type.Object({
      id: Type.String({ description: 'Id resep' }),
      nama: Type.String({
        description: 'Nama resep',
        examples: ['Opor Ayam', 'Sayur Sop'],
      }),
      bahan: Type.Array(Type.String(), {
        description: 'Bahan-bahan resep',
        examples: ['2 Cabe Merah', '1 Lengkuas (dihaluskan)'],
      }),
      langkah: Type.Array(Type.String(), {
        description: 'Langkah-langkah dalam membuat resep',
      }),
    }),

    404: DefaultResponse404Schema,
  });

  type GetRecipeResponseSchemas = ResponseSchema<
    typeof getRecipeResponseSchemas
  >;

  fastify.get<{
    Params: GetRecipeParamsSchema;
    Reply: GetRecipeResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        description: 'Mengambil resep berdasarkan id',
        params: getRecipeParamsSchema,
        response: getRecipeResponseSchemas,
      },
    },
    async (req, res) => {
      try {
        const docRef = getDocRef(req.params.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return res.callNotFound();
        }

        return res.code(200).send({
          id: docSnap.id,
          ...docSnap.data(),
        } as any);
      } catch (e) {
        return res.code(500).send();
      }
    }
  );

  /**
   * update resep berdasarkan id
   */

  const updateRecipeParamsSchema = Type.Object({
    id: Type.String({ description: 'Id resep yang ingin di update' }),
  });

  type UpdateRecipeParamsSchema = ObjectSchemaToType<
    typeof updateRecipeParamsSchema
  >;

  const updateRecipeBodySchema = Type.Object({
    nama: Type.Optional(
      Type.String({
        description: 'Nama resep',
        examples: ['Opor Ayam', 'Sayur Sop'],
      })
    ),
    bahan: Type.Optional(
      Type.Array(Type.String(), {
        description: 'Bahan-bahan resep',
        examples: ['2 Cabe Merah', '1 Lengkuas (dihaluskan)'],
      })
    ),
    langkah: Type.Optional(
      Type.Array(Type.String(), {
        description: 'Langkah-langkah dalam membuat resep',
      })
    ),
  });

  type UpdateRecipeBodySchema = ObjectSchemaToType<
    typeof updateRecipeBodySchema
  >;

  const updateRecipeResponseSchemas = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
    400: DefaultResponse400Schema,
  });

  type UpdateRecipeResponseSchemas = ResponseSchema<
    typeof updateRecipeResponseSchemas
  >;

  fastify.put<{
    Params: UpdateRecipeParamsSchema;
    Body: UpdateRecipeBodySchema;
    Reply: UpdateRecipeResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        description: 'Mengupdate resep berdasarkan Id',
        params: updateRecipeParamsSchema,
        body: updateRecipeBodySchema,
        response: updateRecipeResponseSchemas,
      },
    },
    async (req, res) => {
      try {
        const docRef = getDocRef(req.params.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return res.callNotFound();
        }

        await updateDoc(docRef, req.body)
          .then(() => {
            res.code(204).send();
          })
          .catch(() => {
            res.code(500).send();
          });
      } catch (e) {
        return res.code(500).send();
      }
    }
  );

  /**
   * Menghapus resep berdasarkan id
   */
  const deleteRecipeParamsSchema = Type.Object({
    id: Type.String({ description: 'Id resep yang ingin dihapus' }),
  });

  type DeleteRecipeParamsSchema = ObjectSchemaToType<
    typeof deleteRecipeParamsSchema
  >;

  const deleteRecipeResponseSchemas = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
  });

  type DeleteRecipeResponseSchemas = ResponseSchema<
    typeof deleteRecipeResponseSchemas
  >;

  fastify.delete<{
    Params: DeleteRecipeParamsSchema;
    Reply: DeleteRecipeResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        description: 'Menghapus resep berdasarkan Id',
        params: deleteRecipeParamsSchema,
        response: deleteRecipeResponseSchemas,
      },
    },
    async (req, res) => {
      try {
        const docRef = getDocRef(req.params.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return res.callNotFound();
        }

        return await deleteDoc(docRef)
          .then(() => {
            res.code(204).send();
          })
          .catch(() => {
            res.code(500).send();
          });
      } catch (e) {
        return res.code(500).send();
      }
    }
  );
};

export default recipesRoutes;
