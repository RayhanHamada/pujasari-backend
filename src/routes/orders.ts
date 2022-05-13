import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
  updateDoc,
  where,
} from 'firebase/firestore';
import db from '~src/common/db';
import {
  AvailableBankSchema,
  AvailablePaymentMethodSchema,
  DefaultResponse204Schema,
  DefaultResponse400Schema,
  DefaultResponse404Schema,
  StatusPemesanan,
} from '~src/common/schema';
import type { ObjectSchemaToType, ResponseSchema } from '~src/common/types';
import { createResponseSchema } from '~src/common/util';

const ordersRoutes: FastifyPluginAsync = async (fastify, _) => {
  /**
   * get orders
   */
  const getOrdersQuerySchema = Type.Object({
    bank: Type.Optional(AvailableBankSchema),
    no_vc: Type.Optional(
      Type.String({
        description: 'Nomor Virtual Account yang dapat digunakan',
      })
    ),
    payment_method: Type.Optional(AvailablePaymentMethodSchema),
    status: Type.Optional(StatusPemesanan),
    user_id: Type.Optional(Type.String({ description: 'ID User pemesan' })),
  });

  type GetOrdersQuerySchema = ObjectSchemaToType<typeof getOrdersQuerySchema>;

  const getOrdersResponseSchema = createResponseSchema({
    200: Type.Array(
      Type.Object({
        id: Type.String({ description: 'Id of the orders' }),
        bank: AvailableBankSchema,
        no_vc: Type.String({
          description: 'Nomor Virtual Account yang dapat digunakan',
        }),
        payment_method: AvailablePaymentMethodSchema,
        status: StatusPemesanan,
        time: Type.Number({ description: 'Waktu pemesanan' }),
        user_id: Type.String({ description: 'ID User pemesan' }),
        checkout_items: Type.Array(
          Type.Object(
            {
              amount: Type.Number({ description: 'Banyak Item' }),
              item_id: Type.String({ description: 'Id produk' }),
            },
            {
              description: 'Produk-produk yang di checkout',
            }
          )
        ),
      }),
      {
        description: 'Success',
      }
    ),
    400: DefaultResponse400Schema,
  });

  type GetOrdersResponseSchema = ResponseSchema<typeof getOrdersResponseSchema>;

  fastify.get<{
    Querystring: GetOrdersQuerySchema;
    Reply: GetOrdersResponseSchema;
  }>(
    '',
    {
      schema: {
        description: 'Mengambil list pesanan',
        response: getOrdersResponseSchema,
        querystring: getOrdersQuerySchema,
      },
    },
    async (req, res) => {
      try {
        const checkoutHistoriesCollection = collection(db, 'checkoutHistories');

        const qcs: QueryConstraint[] = [];

        const requestQuery = req.query;

        Object.keys(requestQuery).forEach((k) => {
          const rq = requestQuery as any;
          if (rq[k]) {
            qcs.push(where(k, '==', rq[k]));
          }
        });

        const snapshot = await getDocs(
          query(checkoutHistoriesCollection, ...qcs)
        );

        if (snapshot.empty) return res.status(200).send([]);

        const datas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        res.status(200).send(datas as any);
      } catch (e) {
        res.status(500).send();
      }
    }
  );

  /**
   * get an order
   */
  const getOrderByIdParamsSchema = Type.Object({
    id: Type.String({ description: 'Id pesanan' }),
  });

  const getOrderByIdResponseSchema = createResponseSchema({
    200: Type.Object(
      {
        id: Type.String({ description: 'Id of the orders' }),
        bank: AvailableBankSchema,
        no_vc: Type.String({
          description: 'Nomor Virtual Account yang dapat digunakan',
        }),
        payment_method: AvailablePaymentMethodSchema,
        status: StatusPemesanan,
        time: Type.Number({ description: 'Waktu pemesanan' }),
        user_id: Type.String({ description: 'ID User pemesan' }),
        checkout_items: Type.Array(
          Type.Object(
            {
              amount: Type.Number({ description: 'Banyak Item' }),
              item_id: Type.String({ description: 'Id produk' }),
            },
            {
              description: 'Produk-produk yang di checkout',
            }
          )
        ),
      },
      {
        description: 'Success',
      }
    ),

    404: DefaultResponse404Schema,
  });

  fastify.get<{
    Reply: ResponseSchema<typeof getOrderByIdResponseSchema>;
    Params: ObjectSchemaToType<typeof getOrderByIdParamsSchema>;
  }>(
    '/:id',
    {
      schema: {
        description: 'Mengambil Pesanan',
        response: getOrderByIdResponseSchema,
        params: getOrderByIdParamsSchema,
      },
    },
    async (req, res) => {
      try {
        const docRef = doc(db, 'checkoutHistories', req.params.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return res.callNotFound();
        }

        return res.status(200).send({
          id: docSnap.id,
          ...docSnap.data(),
        } as any);
      } catch (e) {
        res.code(500).send();
      }
    }
  );

  /**
   * Mengupdate pesanan
   */
  const updateOrderByIdParamSchema = Type.Object({
    id: Type.String({ description: 'Id pesanan' }),
  });

  const updateOrderByIdBody = Type.Object({
    status: Type.Optional(StatusPemesanan),
  });

  const updateOrderByIdResponseSchema = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
    400: DefaultResponse400Schema,
  });

  fastify.put<{
    Params: ObjectSchemaToType<typeof updateOrderByIdParamSchema>;
    Body: ObjectSchemaToType<typeof updateOrderByIdBody>;
    Reply: ResponseSchema<typeof updateOrderByIdResponseSchema>;
  }>(
    '/:id',
    {
      schema: {
        description: 'Mengupdate data pesanan',
        params: updateOrderByIdParamSchema,
        body: updateOrderByIdBody,
        response: updateOrderByIdResponseSchema,
      },
    },
    async (req, res) => {
      try {
        const docRef = doc(db, 'checkoutHistories', req.params.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return res.callNotFound();
        }

        await updateDoc(docRef, {
          ...req.body,
        })
          .then(() => {
            res.code(204).send();
          })
          .catch(() => {
            res.code(500).send();
          });
      } catch (e) {
        res.code(500).send();
      }
    }
  );

  /**
   * delete pesanan
   */
  const deleteOrderByIdParamsSchema = Type.Object({
    id: Type.String({ description: 'Id pesanan' }),
  });

  const deleteOrderByIdResponseSchemas = createResponseSchema({
    204: DefaultResponse204Schema,
    404: DefaultResponse404Schema,
  });

  fastify.delete<{
    Params: ObjectSchemaToType<typeof deleteOrderByIdParamsSchema>;
    Reply: ResponseSchema<typeof deleteOrderByIdResponseSchemas>;
  }>(
    '/:id',
    {
      schema: {
        description: 'Menghapus data pesanan',
        params: deleteOrderByIdParamsSchema,
        response: deleteOrderByIdResponseSchemas,
      },
    },
    async (req, res) => {
      try {
        const docRef = doc(db, 'checkoutHistories', req.params.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return res.callNotFound();
        }

        await deleteDoc(docRef)
          .then(() => {
            res.code(204).send();
          })
          .catch(() => {
            res.code(500).send();
          });
      } catch (e) {
        res.code(500).send();
      }
    }
  );
};

export default ordersRoutes;
