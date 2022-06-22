import { TSchema, Type } from '@sinclair/typebox';
import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
} from 'firebase/firestore';
import db from './db';
import { ResponseCode } from './types';

const defaultResponseSchemas = {
  500: Type.Object(
    {
      statusCode: Type.Literal(500),
      error: Type.Literal('Internal Server Error'),
      message: Type.String(),
    },
    {
      description: 'Internal Server Error',
    }
  ),
};

export const createResponseSchema = <
  T extends Partial<Record<ResponseCode, TSchema>>
>(
  responseSchema: T
) => {
  return {
    ...defaultResponseSchemas,
    ...responseSchema,
  };
};

// type FirestoreRefsMap = {
//   colRef: CollectionReference;
//   docRef: (docId: string) => DocumentReference;
// };

// type CreateFirestoreRefs = <ColName extends string>(
//   collectionName: ColName
// ) => {
//   [K in keyof FirestoreRefsMap as `${ColName}${Capitalize<K>}`]: FirestoreRefsMap[K];
// };

export const createFirestoreRefs = (collectionName: string) => ({
  /**
   * collection reference ke collectionName
   */
  colRef: collection(db, collectionName),

  /**
   * document reference dari collectionName/docId
   */
  docRef: (docId: string) => doc(db, collectionName, docId),
});
