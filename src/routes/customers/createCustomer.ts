import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { addDoc } from 'firebase/firestore';
import { DefaultResponse400Schema } from 'src/common/schema';
import {
  CustomRouteHandler,
  HandlerGeneric,
  ObjectSchemaToType,
  ResponseSchema,
} from 'src/common/types';
import { createFirestoreRefs, createResponseSchema } from 'src/common/util';

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

const createCustomerResponseSchemas = createResponseSchema({
  200: Type.Object({
    id: Type.String({ description: 'Id customer yang ditambahkan' }),
  }),
  400: DefaultResponse400Schema,
});

export const createCustomerSchema: FastifySchema = {
  description: 'Membuat data dokumen',
  tags: ['Customer'],
  body: createCustomerBodySchema,
  response: createCustomerResponseSchemas,
};

export type CreateCustomerSchema = HandlerGeneric<{
  Body: ObjectSchemaToType<typeof createCustomerBodySchema>;
  Reply: ResponseSchema<typeof createCustomerResponseSchemas>;
}>;

const { colRef } = createFirestoreRefs('users');

export const createCustomer: CustomRouteHandler<CreateCustomerSchema> =
  async function (req, res) {
    const addedDoc = await addDoc(colRef, {
      ...req.body,
      current_checkout_items: [],
    })
      .then((v) => {
        this.log.info(`User ${v.id} ditambahkan`);

        return v;
      })
      .catch((err) => {
        this.log.error(`Gagal menambahkan user`);
        this.log.trace(err);

        return undefined;
      });

    if (!addedDoc) {
      return res.code(500).send();
    }

    const id = addedDoc.id;

    res.code(200).send({ id });
  };
