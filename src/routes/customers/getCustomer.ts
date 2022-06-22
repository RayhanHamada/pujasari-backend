import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { getDoc } from 'firebase/firestore';
import { DefaultResponse404Schema } from 'src/common/schema';
import {
  CustomRouteHandler,
  HandlerGeneric,
  ObjectSchemaToType,
  ResponseSchema,
} from 'src/common/types';
import { createResponseSchema } from 'src/common/util';
import adminUtils from 'src/routes/admins/adminUtils';
import customersUtils from 'src/routes/customers/customersUtils';

const getCustomerParamsSchema = Type.Object({
  id: Type.String({ description: 'Id customer' }),
});

const getCustomerResponseSchemas = createResponseSchema({
  200: Type.Object(
    {
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
    },
    {
      description: 'Sukses mengambil customer',
    }
  ),

  404: DefaultResponse404Schema,
});

export const getCustomerSchema: FastifySchema = {
  params: getCustomerParamsSchema,
  response: getCustomerResponseSchemas,
};

export type GetCustomerSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof getCustomerParamsSchema>;
  Reply: ResponseSchema<typeof getCustomerResponseSchemas>;
}>;

export const getCustomer: CustomRouteHandler<GetCustomerSchema> =
  async function (req, res) {
    const docRef = customersUtils.docRef(req.params.id);
    const docSnap = await getDoc(docRef)
      .then((docSnap) => {
        this.log.info(`Customer of id ${req.params.id} found`);

        return docSnap;
      })
      .catch((err) => {
        this.log.error(`Failed when get customer`);
        this.log.trace(err);

        return undefined;
      });

    if (!docSnap?.exists()) {
      this.log.info(`Customer of id ${req.params.id} are not found`);
      return res.callNotFound();
    }

    const customer = {
      id: docSnap.id,
      ...docSnap.data(),
    } as any;

    return res.code(200).send(customer);
  };
