import { TSchema, Type } from '@sinclair/typebox';
import { ResponseCode } from './types';

const defaultResponseSchemas = {
  500: Type.Object(
    {
      errorMsg: Type.Literal('Internal Server Error'),
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
