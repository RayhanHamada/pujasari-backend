import { Static, TSchema } from '@sinclair/typebox';

export type ResponseCode = 200 | 204 | 400 | 404 | 500;

export type ResponseSchema<T extends Record<keyof T, TSchema>> = Static<
  T[keyof T]
>;

export type ObjectSchemaToType<T extends TSchema> = Static<T>;
