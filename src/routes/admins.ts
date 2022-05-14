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
} from '~src/common/schema';
import { ObjectSchemaToType, ResponseSchema } from '~src/common/types';
import {
  createCollectionRef,
  createDocRefFetcher,
  createResponseSchema,
} from '~src/common/util';

const collectionName = 'admins';
const colRef = createCollectionRef(collectionName);
const getDocRef = createDocRefFetcher(collectionName);

const adminsRoutes: FastifyPluginAsync = async (fastify, _) => {
  /**
   * Membuat user baru
   */
  const createAdminBodySchema = Type.Object({
    alamat: Type.Optional(
      Type.String({
        description: 'Alamat admin',
        examples: ['Jl. Kenangan 2', 'Jl. Salak 3'],
        default: '',
      })
    ),
    email: Type.RegEx(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      {
        description: 'Email admin',
        examples: ['someone@something.com'],
      }
    ),
    name: Type.String({
      description: 'Nama admin',
      examples: ['Aji', 'Budi'],
    }),
    no_hp: Type.RegEx(/^\d{12,}$/, {
      description: 'No handphone admin',
      examples: ['0812xxxx2343'],
    }),
    admin_kind: Type.Optional(
      Type.Union([Type.Literal('employee'), Type.Literal('owner')], {
        description: 'Jenis admin (employee, owner)',
        default: 'employee',
      })
    ),
  });

  type CreateAdminBodySchema = ObjectSchemaToType<typeof createAdminBodySchema>;

  const createAdminResponseSchemas = createResponseSchema({
    200: Type.Object({
      id: Type.String({ description: 'Id admin yang ditambahkan' }),
    }),
    400: DefaultResponse400Schema,
  });

  type CreateAdminResponseSchemas = ResponseSchema<
    typeof createAdminResponseSchemas
  >;

  fastify.post<{
    Body: CreateAdminBodySchema;
    Reply: CreateAdminResponseSchemas;
  }>(
    '',
    {
      schema: {
        description: 'Membuat admin baru',
        body: createAdminBodySchema,
        response: createAdminResponseSchemas,
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
   * Melihat list admin
   */

  const getAdminsQuerySchema = Type.Object({});

  type GetAdminsQuerySchema = ObjectSchemaToType<typeof getAdminsQuerySchema>;

  const getAdminsResponseSchemas = createResponseSchema({
    200: Type.Array(
      Type.Object({
        id: Type.String({ description: 'Id admin' }),
        alamat: Type.String({
          description: 'Alamat admin',
          examples: ['Jl. Kenangan 2', 'Jl. Salak 3'],
          default: '',
        }),
        email: Type.RegEx(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          {
            description: 'Email admin',
            examples: ['someone@something.com'],
          }
        ),
        name: Type.String({
          description: 'Nama admin',
          examples: ['Aji', 'Budi'],
        }),
        no_hp: Type.RegEx(/^\d{12,}$/, {
          description: 'No handphone admin',
          examples: ['0812xxxx2343'],
        }),
        admin_kind: Type.Optional(
          Type.Union([Type.Literal('employee'), Type.Literal('owner')], {
            description: 'Jenis admin (employee, owner)',
            default: 'employee',
          })
        ),
      })
    ),

    400: DefaultResponse400Schema,
  });

  type GetAdminsResponseSchemas = ResponseSchema<
    typeof getAdminsResponseSchemas
  >;

  fastify.get<{
    Querystring: GetAdminsQuerySchema;
    Reply: GetAdminsResponseSchemas;
  }>(
    '',
    {
      schema: {
        description: 'Mengambil list admin',
        querystring: getAdminsQuerySchema,
        response: getAdminsResponseSchemas,
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
   * Melihat admin berdasarkan id
   */

  const getAdminParamsSchema = Type.Object({
    id: Type.String({ description: 'Id admin' }),
  });

  type GetAdminParamsSchema = ObjectSchemaToType<typeof getAdminParamsSchema>;

  const getAdminResponseSchemas = createResponseSchema({
    200: Type.Object({
      id: Type.String({ description: 'Id admin' }),
      alamat: Type.Optional(
        Type.String({
          description: 'Alamat admin',
          examples: ['Jl. Kenangan 2', 'Jl. Salak 3'],
          default: '',
        })
      ),
      email: Type.RegEx(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        {
          description: 'Email admin',
          examples: ['someone@something.com'],
        }
      ),
      name: Type.String({
        description: 'Nama admin',
        examples: ['Aji', 'Budi'],
      }),
      no_hp: Type.RegEx(/^\d{12,}$/, {
        description: 'No handphone admin',
        examples: ['0812xxxx2343'],
      }),
      admin_kind: Type.Optional(
        Type.Union([Type.Literal('employee'), Type.Literal('owner')], {
          description: 'Jenis admin (employee, owner)',
          default: 'employee',
        })
      ),
    }),

    404: DefaultResponse404Schema,
  });

  type GetAdminResponseSchemas = ResponseSchema<typeof getAdminResponseSchemas>;

  fastify.get<{
    Params: GetAdminParamsSchema;
    Reply: GetAdminResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        description: 'Mengambil admin berdasarkan id',
        params: getAdminParamsSchema,
        response: getAdminResponseSchemas,
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
   * update admin berdasarkan id
   */

  const updateAdminParamsSchema = Type.Object({
    id: Type.String({ description: 'Id admin yang ingin di update' }),
  });

  type UpdateAdminParamsSchema = ObjectSchemaToType<
    typeof updateAdminParamsSchema
  >;

  const updateAdminBodySchema = Type.Object({
    alamat: Type.Optional(
      Type.String({
        description: 'Alamat admin',
        examples: ['Jl. Kenangan 2', 'Jl. Salak 3'],
        default: '',
      })
    ),
    name: Type.Optional(
      Type.String({
        description: 'Nama admin',
        examples: ['Aji', 'Budi'],
      })
    ),
    no_hp: Type.Optional(
      Type.RegEx(/^\d{12,}$/, {
        description: 'No handphone admin',
        examples: ['0812xxxx2343'],
      })
    ),
  });

  type UpdateAdminBodySchema = ObjectSchemaToType<typeof updateAdminBodySchema>;

  const updateAdminResponseSchemas = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
    400: DefaultResponse400Schema,
  });

  type UpdateAdminResponseSchemas = ResponseSchema<
    typeof updateAdminResponseSchemas
  >;

  fastify.put<{
    Params: UpdateAdminParamsSchema;
    Body: UpdateAdminBodySchema;
    Reply: UpdateAdminResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        description: 'Mengupdate admin berdasarkan Id',
        params: updateAdminParamsSchema,
        body: updateAdminBodySchema,
        response: updateAdminResponseSchemas,
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
   * Menghapus admin berdasarkan id
   */
  const deleteAdminParamsSchema = Type.Object({
    id: Type.String({ description: 'Id admin yang ingin dihapus' }),
  });

  type DeleteAdminParamsSchema = ObjectSchemaToType<
    typeof deleteAdminParamsSchema
  >;

  const deleteAdminResponseSchemas = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
  });

  type DeleteAdminResponseSchemas = ResponseSchema<
    typeof deleteAdminResponseSchemas
  >;

  fastify.delete<{
    Params: DeleteAdminParamsSchema;
    Reply: DeleteAdminResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        description: 'Menghapus admin berdasarkan Id',
        params: deleteAdminParamsSchema,
        response: deleteAdminResponseSchemas,
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

export default adminsRoutes;
