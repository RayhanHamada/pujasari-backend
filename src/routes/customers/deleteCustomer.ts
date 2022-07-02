import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import { deleteDoc, getDoc } from 'firebase/firestore';
import {
  DefaultResponse204Schema,
  DefaultResponse404Schema,
} from 'src/common/schema';
import type {
  CustomRouteHandler,
  HandlerGeneric,
  ObjectSchemaToType,
  ResponseSchema,
} from 'src/common/types';
import { createFirestoreRefs, createResponseSchema } from 'src/common/util';

const deleteCustomerParamsSchema = Type.Object({
  id: Type.String({ description: 'Id customer yang ingin dihapus' }),
});

const deleteCustomerResponseSchemas = createResponseSchema({
  204: DefaultResponse204Schema,
  404: DefaultResponse404Schema,
});

export const deleteCustomerSchema: FastifySchema = {
  description: 'Menghapus customer berdasarkan Id',
  tags: ['Customers'],
  params: deleteCustomerParamsSchema,
  response: deleteCustomerResponseSchemas,
};

export type DeleteCustomerSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof deleteCustomerParamsSchema>;
  Reply: ResponseSchema<typeof deleteCustomerResponseSchemas>;
}>;

const { docRef } = createFirestoreRefs('users');

export const deleteCustomer: CustomRouteHandler<DeleteCustomerSchema> =
  async function (req, res) {
    const ref = docRef(req.params.id);
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      this.log.info(`Customer ${req.params.id} not exists`);
      return res.callNotFound();
    }

    return await deleteDoc(ref)
      .then(() => {
        return res.code(204).send();
      })
      .catch(() => {
        return res.code(500).send();
      });
  };
