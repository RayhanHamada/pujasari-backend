import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { addDoc } from 'firebase/firestore';
import { DefaultResponse400Schema } from '~src/common/schema';
import { ObjectSchemaToType, ResponseSchema } from '~src/common/types';
import {
  createCollectionRef,
  createDocRefFetcher,
  createResponseSchema,
} from '~src/common/util';

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
};

export default recipesRoutes;
