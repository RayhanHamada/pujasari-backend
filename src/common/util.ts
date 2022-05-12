import { TSchema, Type } from '@sinclair/typebox';
import { ResponseCode } from './types';

export const createResponseSchema = <
  T extends Partial<Record<ResponseCode, TSchema>>
>(
  responseObject: T
) => {
  return {
    ...responseObject,
    500: Type.Object({
      errorMsg: Type.Literal('Internal Server Error'),
    }),
    404: Type.Object({
      errorMsg: Type.Literal('Item Not Found'),
    }),
  };
};
