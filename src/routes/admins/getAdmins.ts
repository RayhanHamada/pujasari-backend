import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import { getDocs, query } from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { DefaultResponse400Schema } from 'src/common/schema';
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
import { assert } from 'console';

const getAdminsResponseSchemas = createResponseSchema({
  200: Type.Array(
    Type.Object({
      id: Type.String({ description: 'Id admin' }),
      alamat: Type.String({
        description: 'Alamat admin',
        examples: ['Jl. Kenangan 2', 'Jl. Salak 3'],
        default: '',
      }),
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
    }),
    {
      description: 'Admin-admin sukses diambil',
    }
  ),
  400: DefaultResponse400Schema,
});

export const getAdminsSchema: FastifySchema = {
  tags: ['Admin'],
  description: 'Mengambil data admin',
  response: getAdminsResponseSchemas,
};

export type GetAdminsSchema = HandlerGeneric<{
  Reply: ResponseSchema<typeof getAdminsResponseSchemas>;
}>;

const collectionName = 'admins';
const colRef = createCollectionRef(collectionName);
const getDocRef = createDocRefFetcher(collectionName);

export const getAdmins: CustomRouteHandler<GetAdminsSchema> = async function (
  req,
  res
) {
  const queries: QueryConstraint[] = [];
  const queried = query(colRef, ...queries);
  const docs = await getDocs(queried)
    .then((v) => {
      this.log.info(`Berhasil mengambil ${v.docs.length} admin`);

      return v.docs;
    })
    .catch((err) => {
      this.log.error(`Gagal mengambil data admin`);
      this.log.trace(err);

      return undefined;
    });

  if (!docs) {
    return res.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: `Gagal saat mengambil data admin`,
    });
  }

  if (docs.length === 0) {
    this.log.info(`Admin kosong`);

    return res.code(200).send([]);
  }

  return res.code(200).send(
    docs.map(
      (d) =>
        ({
          id: d.id,
          ...d.data(),
        } as any)
    )
  );
};
