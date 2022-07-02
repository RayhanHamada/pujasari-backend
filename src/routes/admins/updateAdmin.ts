/**
 * update admin berdasarkan id
 */

import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import { updateDoc } from 'firebase/firestore';
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

const updateAdminParamsSchema = Type.Object({
  id: Type.String({ description: 'Id admin yang ingin di update' }),
});

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

const updateAdminResponseSchemas = createResponseSchema({
  204: DefaultResponse204Schema,
  404: DefaultResponse404Schema,
  400: DefaultResponse400Schema,
});

export type UpdateAdminSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof updateAdminParamsSchema>;
  Body: ObjectSchemaToType<typeof updateAdminBodySchema>;
  Reply: ResponseSchema<typeof updateAdminResponseSchemas>;
}>;

export const updateAdminSchema: FastifySchema = {
  description: 'Mengupdate admin berdasarkan Id (Hanya untuk admin owner)',
  params: updateAdminParamsSchema,
  body: updateAdminBodySchema,
  response: updateAdminResponseSchemas,
};

const { docRef } = createFirestoreRefs('admins');

export const updateAdmin: CustomRouteHandler<UpdateAdminSchema> =
  async function (req, res) {
    const ref = docRef(req.params.id);

    await updateDoc(ref, req.body)
      .then(() => {
        this.log.info(`Update admin dengan id ${req.params.id} Berhasil`);

        return res.code(204).send();
      })
      .catch((err) => {
        this.log.error(`Gagal mengupdate data admin ${req.params.id}`);
        this.log.trace(err);

        return res.code(500).send();
      });
  };
