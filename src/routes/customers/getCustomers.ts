import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { QueryConstraint, query, getDocs } from 'firebase/firestore';
import { DefaultResponse400Schema } from 'src/common/schema';
import {
  CustomRouteHandler,
  HandlerGeneric,
  ObjectSchemaToType,
  ResponseSchema,
} from 'src/common/types';
import {
  createCollectionRef,
  createDocRefFetcher,
  createResponseSchema,
} from 'src/common/util';

const getCustomersQuerySchema = Type.Object(
  {},
  {
    description: 'queri GET /customers',
  }
);

const collectionName = 'users';
const colRef = createCollectionRef(collectionName);
const getDocRef = createDocRefFetcher(collectionName);

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
    }),
    {
      description: `Customers sukses diambil`,
    }
  ),

  400: DefaultResponse400Schema,
});

export const getCustomersSchema: FastifySchema = {
  tags: ['Customers'],
  description: 'Get customers',
  querystring: getCustomersQuerySchema,
  response: getCustomersResponseSchemas,
};

export type GetCustomersSchema = HandlerGeneric<{
  Querystring: ObjectSchemaToType<typeof getCustomersQuerySchema>;
  Reply: ResponseSchema<typeof getCustomersResponseSchemas>;
}>;

export const getCustomers: CustomRouteHandler<GetCustomersSchema> =
  async function (req, res) {
    const queries: QueryConstraint[] = [];
    const queried = query(colRef, ...queries);
    const docs = await getDocs(queried)
      .then((snapshot) => {
        this.log.info(`Fetched ${snapshot.size} customers`);

        return snapshot.docs;
      })
      .catch((err) => {
        this.log.error(`Failed when fetching customers`);

        return undefined;
      });

    if (!docs) {
      return res.code(500).send();
    }

    const customers = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    return res.code(200).send(customers);
  };
