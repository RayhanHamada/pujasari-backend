import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import {
  deleteDoc,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  AvailableBankSchema,
  AvailablePaymentMethodSchema,
  DefaultResponse204Schema,
  DefaultResponse400Schema,
  DefaultResponse404Schema,
  StatusPemesanan,
} from 'src/common/schema';
import type { ObjectSchemaToType, ResponseSchema } from 'src/common/types';
import {
  createCollectionRef,
  createDocRefFetcher,
  createResponseSchema,
} from 'src/common/util';

const ordersRoutes: FastifyPluginAsync = async (fastify, _) => {
  /**
   * Mengambil list pesanan
   */
  const getOrdersQuerySchema = Type.Object({
    bank: Type.Optional(AvailableBankSchema),
    payment_method: Type.Optional(AvailablePaymentMethodSchema),
    status: Type.Optional(StatusPemesanan),
    fromDate: Type.Optional(
      Type.Number({
        description: 'timestamp awal periode',
        examples: ['1652521028791'],
        default: 0,
      })
    ),
    toDate: Type.Optional(
      Type.Number({
        description: 'timestamp akhir periode',
        examples: ['1652521028791'],
        default: Number.POSITIVE_INFINITY,
      })
    ),
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
        const qcs: QueryConstraint[] = [];

        const rq = req.query;
        const equalizables: Exclude<
          keyof typeof req.query,
          'toDate' | 'fromDate'
        >[] = ['bank', 'payment_method', 'status'];

        Object.keys(rq).forEach((k) => {
          const _rq = rq as any;
          if (_rq[k] && k in equalizables) {
            qcs.push(where(k, '==', _rq[k]));
          }
        });

        if (rq.fromDate) {
          qcs.push(where('time', '>=', rq.fromDate));
        }

        if (rq.toDate) {
          qcs.push(where('time', '<=', rq.toDate));
        }

        const snapshot = await getDocs(query(colRef, ...qcs));

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
   * Mengambil sebuah pesanan berdasarkan id
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
        const docRef = getDocRef(req.params.id);
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
        const docRef = getDocRef(req.params.id);
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
        const docRef = getDocRef(req.params.id);
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
