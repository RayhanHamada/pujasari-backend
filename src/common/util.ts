import { TSchema, Type } from '@sinclair/typebox';
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

// export const createConverter = () =>
