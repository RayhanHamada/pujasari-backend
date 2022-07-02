import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { getDoc, updateDoc } from 'firebase/firestore';
import {
  DefaultResponse204Schema,
  DefaultResponse400Schema,
  DefaultResponse404Schema,
} from 'src/common/schema';
import {
  CustomRouteHandler,
  HandlerGeneric,
  ObjectSchemaToType,
  ResponseSchema,
} from 'src/common/types';
import { createFirestoreRefs, createResponseSchema } from 'src/common/util';

const updateCustomerParamsSchema = Type.Object({
  id: Type.String({ description: 'Id customer yang ingin di update' }),
});

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

const updateCustomerResponseSchemas = createResponseSchema({
  204: DefaultResponse204Schema,
  404: DefaultResponse404Schema,
  400: DefaultResponse400Schema,
});

export type UpdateCustomerSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof updateCustomerParamsSchema>;
  Body: ObjectSchemaToType<typeof updateCustomerBodySchema>;
  Reply: ResponseSchema<typeof updateCustomerResponseSchemas>;
}>;

export const updateCustomerSchema: FastifySchema = {
  description: 'Mengupdate customer berdasarkan Id',
  tags: ['Customers'],
  params: updateCustomerParamsSchema,
  body: updateCustomerBodySchema,
  response: updateCustomerResponseSchemas,
};

const { docRef } = createFirestoreRefs('users');

export const updateCustomer: CustomRouteHandler<UpdateCustomerSchema> =
  async function (req, res) {
    const ref = docRef(req.params.id);
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      return res.callNotFound();
    }

    return await updateDoc(ref, req.body)
      .then(() => {
        this.log.info(`Sukses mengupdate ${docSnap.id}`);

        return res.code(204).send();
      })
      .catch((err) => {
        this.log.error(`Failed to update customer ${docSnap.id}`);
        this.log.trace(err);

        return res.code(500).send();
      });
  };
