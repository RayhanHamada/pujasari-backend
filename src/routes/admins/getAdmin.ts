import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import { getDoc } from 'firebase/firestore';
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

const getAdminParamsSchema = Type.Object({
  id: Type.String({
    description: 'Id admin yang akan diambil',
  }),
});

const getAdminResponseSchemas = createResponseSchema({
  200: Type.Object(
    {
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
    },
    {
      description: 'Admin sukses diambil',
    }
  ),
  400: DefaultResponse400Schema,
});

export const getAdminSchema: FastifySchema = {
  tags: ['Admin'],
  description: 'Mengambil data admin',
  params: getAdminParamsSchema,
  response: getAdminResponseSchemas,
};

export type GetAdminSchema = HandlerGeneric<{
  Params: ObjectSchemaToType<typeof getAdminParamsSchema>;
  Reply: ResponseSchema<typeof getAdminResponseSchemas>;
}>;

const collectionName = 'admins';
const colRef = createCollectionRef(collectionName);
const getDocRef = createDocRefFetcher(collectionName);

export const getAdmin: CustomRouteHandler<GetAdminSchema> = async function (
  req,
  res
) {
  const docRef = getDocRef(req.params.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return res.callNotFound();
  }

  const data = docSnap.data() as any;

  return res.code(200).send({
    id: docSnap.id,
    ...data,
  });
};
