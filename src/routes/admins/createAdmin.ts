import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import { addDoc } from 'firebase/firestore';
import { DefaultResponse400Schema } from 'src/common/schema';
import {
  CustomRouteHandler,
  HandlerGeneric,
  ObjectSchemaToType,
  ResponseSchema,
} from 'src/common/types';
import { createResponseSchema } from 'src/common/util';
import adminUtils from 'src/routes/admins/adminUtils';

/**
 * Membuat admin baru
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

const createAdminResponseSchemas = createResponseSchema({
  200: Type.Object(
    {
      id: Type.String({ description: 'Id admin yang ditambahkan' }),
    },
    {
      description: 'Admin berhasil ditambahkan',
    }
  ),
  400: DefaultResponse400Schema,
});

export const createAdminSchema: FastifySchema = {
  tags: ['Admin'],
  description: 'Membuat admin baru',
  body: createAdminBodySchema,
  response: createAdminResponseSchemas,
};

export type CreateAdminSchema = HandlerGeneric<{
  Body: ObjectSchemaToType<typeof createAdminBodySchema>;
  Reply: ResponseSchema<typeof createAdminResponseSchemas>;
}>;

export const createAdmin: CustomRouteHandler<CreateAdminSchema> =
  async function (req, res) {
    const id = await addDoc(adminUtils.colRef, req.body)
      .then((doc) => {
        this.log.info(`Added admin id => ${doc.id}`);

        return doc.id;
      })
      .catch((err) => {
        this.log.error(`Error when creating admin`);
        this.log.trace(err);

        return undefined;
      });

    if (!id) {
      return res.code(500).send();
    }

    return res.code(200).send({ id });
  };
