import type { FastifyPluginAsync } from 'fastify';
import {
  createProduct,
  createProductSchema,
  CreateProductSchema,
} from 'src/routes/products/createProduct';
import {
  deleteProduct,
  DeleteProductSchema,
  deleteProductSchema,
} from 'src/routes/products/deleteProduct';
import {
  getProduct,
  GetProductSchema,
  getProductSchema,
} from 'src/routes/products/getProduct';
import {
  getProducts,
  getProductsSchema,
  GetProductsSchema,
} from 'src/routes/products/getProducts';
import {
  updateProduct,
  UpdateProductSchema,
  updateProductSchema,
} from 'src/routes/products/updateProduct';

export const productRoutes: FastifyPluginAsync = async function (app, _) {
  app.get<GetProductsSchema>(
    '',
    {
      schema: getProductsSchema,
    },
    getProducts
  );

  app.get<GetProductSchema>(
    '/:id',
    {
      schema: getProductSchema,
    },
    getProduct
  );

  app.post<CreateProductSchema>(
    '',
    {
      schema: createProductSchema,
    },
    createProduct
  );

  app.put<UpdateProductSchema>(
    '/:id',
    {
      schema: updateProductSchema,
    },
    updateProduct
  );

  app.delete<DeleteProductSchema>(
    '/:id',
    {
      schema: deleteProductSchema,
    },
    deleteProduct
  );
};
