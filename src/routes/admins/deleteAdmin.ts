import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import { deleteDoc, getDoc } from 'firebase/firestore';
import {
  DefaultResponse204Schema,
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

const deleteAdminParamsSchema = Type.Object({
  id: Type.String({
    description: 'Id admin yang akan dihapus',
  }),
});

const deleteAdminResponseSchemas = createResponseSchema({
  204: DefaultResponse204Schema,
  400: DefaultResponse400Schema,
});

export const deleteAdminSchema: FastifySchema = {
  tags: ['Admin'],
  description: 'Menghapus admin (Hanya untuk admin owner)',
  params: deleteAdminParamsSchema,
  response: deleteAdminResponseSchemas,
};

export type DeleteAdminSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof deleteAdminParamsSchema>;
  Reply: ResponseSchema<typeof deleteAdminResponseSchemas>;
}>;

const collectionName = 'admins';
const colRef = createCollectionRef(collectionName);
const getDocRef = createDocRefFetcher(collectionName);

export const deleteAdmin: CustomRouteHandler<DeleteAdminSchema> =
  async function (req, res) {
    const docRef = getDocRef(req.params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.callNotFound();
    }

    const deleted = await deleteDoc(docRef)
      .then(() => {
        this.log.info(`Admin ${docRef.id} terhapus`);
        return true;
      })
      .catch((err) => {
        this.log.error(`Admin ${docRef.id} tidak berhasil terhapus`);
        this.log.trace(err);

        return false;
      });

    if (!deleted) {
      return res.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: `Failed when deleting user`,
      });
    }

    return res.code(204).send();
  };
