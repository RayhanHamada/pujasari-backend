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

const collectionName = 'users';
const colRef = createCollectionRef(collectionName);
const getDocRef = createDocRefFetcher(collectionName);

const customersRoutes: FastifyPluginAsync = async (fastify, _) => {
  /**
   * Membuat user baru
   */
  const createCustomerBodySchema = Type.Object({
    alamat: Type.Optional(
      Type.String({
        description: 'Alamat customer',
        examples: ['Jl. Kenangan 2', 'Jl. Salak 3'],
        default: '',
      })
    ),
    email: Type.RegEx(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      {
        description: 'Email customer',
        examples: ['someone@something.com'],
      }
    ),
    name: Type.String({
      description: 'Nama customer',
      examples: ['Aji', 'Budi'],
    }),
    no_hp: Type.RegEx(/^\d{12,}$/, {
      description: 'No handphone customer',
      examples: ['0812xxxx2343'],
    }),
    photo_url: Type.Optional(
      Type.String({
        description: 'URL foto customer',
        examples: ['https://image/photo.jpg'],
        default: null,
      })
    ),
  });

  type CreateCustomerBodySchema = ObjectSchemaToType<
    typeof createCustomerBodySchema
  >;

  const createCustomerResponseSchemas = createResponseSchema({
    200: Type.Object({
      id: Type.String({ description: 'Id customer yang ditambahkan' }),
    }),
    400: DefaultResponse400Schema,
  });

  type CreateCustomerResponseSchemas = ResponseSchema<
    typeof createCustomerResponseSchemas
  >;

  fastify.post<{
    Body: CreateCustomerBodySchema;
    Reply: CreateCustomerResponseSchemas;
  }>(
    '',
    {
      schema: {
        description: 'Membuat customer baru',
        body: createCustomerBodySchema,
        response: createCustomerResponseSchemas,
      },
    },
    async (req, res) => {
      try {
        const addedDoc = await addDoc(colRef, {
          ...req.body,
          current_checkout_items: [],
        });

        const id = addedDoc.id;

        res.code(200).send({ id });
      } catch (e) {
        res.code(500).send();
      }
    }
  );

  /**
   * Melihat list customer
   */

  const getCustomersQuerySchema = Type.Object({});

  type GetCustomersQuerySchema = ObjectSchemaToType<
    typeof getCustomersQuerySchema
  >;

  const getCustomersResponseSchemas = createResponseSchema({
    200: Type.Array(
      Type.Object({
        id: Type.String({ description: 'Id customer' }),
        alamat: Type.String({
          description: 'Alamat customer',
          examples: ['Jl. Kenangan 2', 'Jl. Salak 3'],
          default: '',
        }),
        email: Type.RegEx(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          {
            description: 'Email customer',
            examples: ['someone@something.com'],
          }
        ),
        name: Type.String({
          description: 'Nama customer',
          examples: ['Aji', 'Budi'],
        }),
        no_hp: Type.RegEx(/^\d{12,}$/, {
          description: 'No handphone customer',
          examples: ['0812xxxx2343'],
        }),
        photo_url: Type.Optional(
          Type.String({
            description: 'URL foto customer',
            examples: ['https://image/photo.jpg'],
            default: null,
          })
        ),
        current_checkout_items: Type.Array(
          Type.Object({
            itemId: Type.String({
              description: 'Id produk yang dalam proses checkout',
            }),
            amount: Type.Number({
              description: 'Banyak produk yang dalam proses checkout',
            }),
          }),
          {
            description: 'Item-item yang sedang dalam cart checkout customer',
            default: [],
          }
        ),
      })
    ),

    400: DefaultResponse400Schema,
  });

  type GetCustomersResponseSchemas = ResponseSchema<
    typeof getCustomersResponseSchemas
  >;

  fastify.get<{
    Querystring: GetCustomersQuerySchema;
    Reply: GetCustomersResponseSchemas;
  }>(
    '',
    {
      schema: {
        description: 'Mengambil list customer',
        querystring: getCustomersQuerySchema,
        response: getCustomersResponseSchemas,
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
   * Melihat customer berdasarkan id
   */

  const getCustomerParamsSchema = Type.Object({
    id: Type.String({ description: 'Id customer' }),
  });

  type GetCustomerParamsSchema = ObjectSchemaToType<
    typeof getCustomerParamsSchema
  >;

  const getCustomerResponseSchemas = createResponseSchema({
    200: Type.Object({
      id: Type.String({ description: 'Id customer' }),
      alamat: Type.String({
        description: 'Alamat customer',
        examples: ['Jl. Kenangan 2', 'Jl. Salak 3'],
        default: '',
      }),
      email: Type.RegEx(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        {
          description: 'Email customer',
          examples: ['someone@something.com'],
        }
      ),
      name: Type.String({
        description: 'Nama customer',
        examples: ['Aji', 'Budi'],
      }),
      no_hp: Type.RegEx(/^\d{12,}$/, {
        description: 'No handphone customer',
        examples: ['0812xxxx2343'],
      }),
      photo_url: Type.Optional(
        Type.String({
          description: 'URL foto customer',
          examples: ['https://image/photo.jpg'],
          default: null,
        })
      ),
      current_checkout_items: Type.Array(
        Type.Object({
          itemId: Type.String({
            description: 'Id produk yang dalam proses checkout',
          }),
          amount: Type.Number({
            description: 'Banyak produk yang dalam proses checkout',
          }),
        }),
        {
          description: 'Item-item yang sedang dalam cart checkout customer',
          default: [],
        }
      ),
    }),

    404: DefaultResponse404Schema,
  });

  type GetCustomerResponseSchemas = ResponseSchema<
    typeof getCustomerResponseSchemas
  >;

  fastify.get<{
    Params: GetCustomerParamsSchema;
    Reply: GetCustomerResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        description: 'Mengambil customer berdasarkan id',
        params: getCustomerParamsSchema,
        response: getCustomerResponseSchemas,
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
   * update customer berdasarkan id
   */

  const updateCustomerParamsSchema = Type.Object({
    id: Type.String({ description: 'Id customer yang ingin di update' }),
  });

  type UpdateCustomerParamsSchema = ObjectSchemaToType<
    typeof updateCustomerParamsSchema
  >;

  const updateCustomerBodySchema = Type.Object({
    alamat: Type.Optional(
      Type.String({
        description: 'Alamat customer',
        examples: ['Jl. Kenangan 2', 'Jl. Salak 3'],
        default: '',
      })
    ),
    email: Type.Optional(
      Type.RegEx(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        {
          description: 'Email customer',
          examples: ['someone@something.com'],
        }
      )
    ),
    name: Type.Optional(
      Type.String({
        description: 'Nama customer',
        examples: ['Aji', 'Budi'],
      })
    ),
    no_hp: Type.Optional(
      Type.RegEx(/^\d{12,}$/, {
        description: 'No handphone customer',
        examples: ['0812xxxx2343'],
      })
    ),
    photo_url: Type.Optional(
      Type.String({
        description: 'URL foto customer',
        examples: ['https://image/photo.jpg'],
        default: null,
      })
    ),
  });

  type UpdateCustomerBodySchema = ObjectSchemaToType<
    typeof updateCustomerBodySchema
  >;

  const updateCustomerResponseSchemas = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
    400: DefaultResponse400Schema,
  });

  type UpdateCustomerResponseSchemas = ResponseSchema<
    typeof updateCustomerResponseSchemas
  >;

  fastify.put<{
    Params: UpdateCustomerParamsSchema;
    Body: UpdateCustomerBodySchema;
    Reply: UpdateCustomerResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        description: 'Mengupdate customer berdasarkan Id',
        params: updateCustomerParamsSchema,
        body: updateCustomerBodySchema,
        response: updateCustomerResponseSchemas,
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
   * Menghapus customer berdasarkan id
   */
  const deleteCustomerParamsSchema = Type.Object({
    id: Type.String({ description: 'Id customer yang ingin dihapus' }),
  });

  type DeleteCustomerParamsSchema = ObjectSchemaToType<
    typeof deleteCustomerParamsSchema
  >;

  const deleteCustomerResponseSchemas = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
  });

  type DeleteCustomerResponseSchemas = ResponseSchema<
    typeof deleteCustomerResponseSchemas
  >;

  fastify.delete<{
    Params: DeleteCustomerParamsSchema;
    Reply: DeleteCustomerResponseSchemas;
  }>(
    '/:id',
    {
      schema: {
        description: 'Menghapus customer berdasarkan Id',
        params: deleteCustomerParamsSchema,
        response: deleteCustomerResponseSchemas,
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

export default customersRoutes;
