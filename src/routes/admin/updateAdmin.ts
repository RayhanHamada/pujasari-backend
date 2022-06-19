/**
 * update admin berdasarkan id
 */

import { Type } from '@sinclair/typebox';
import fastify, { FastifySchema } from 'fastify';
import { getDoc, updateDoc } from 'firebase/firestore';
import {
  DefaultResponse204Schema,
  DefaultResponse404Schema,
  DefaultResponse400Schema,
} from 'src/common/schema';
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

const collectionName = 'admins';
const colRef = createCollectionRef(collectionName);
const getDocRef = createDocRefFetcher(collectionName);

export const updateAdmin: CustomRouteHandler<UpdateAdminSchema> =
  async function (req, res) {
    const docRef = getDocRef(req.params.id);

    const success = await updateDoc(docRef, req.body)
      .then((d) => {
        this.log.info(`Update admin dengan id ${req.params.id} Berhasil`);

        return true;
      })
      .catch((err) => {
        this.log.error(`Gagal mengupdate data admin ${req.params.id}`);
        this.log.trace(err);

        return false;
      });

    if (!success) {
      return res.callNotFound();
    }

    return res.code(204).send();
  };
