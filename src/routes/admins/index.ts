import { FastifyPluginAsync } from 'fastify';
import {
  createAdmin,
  createAdminSchema,
  CreateAdminSchema,
} from 'src/routes/admins/createAdmin';
import { deleteAdmin, deleteAdminSchema } from 'src/routes/admins/deleteAdmin';
import { getAdmin, getAdminSchema } from 'src/routes/admins/getAdmin';
import { getAdmins, getAdminsSchema } from 'src/routes/admins/getAdmins';
import { updateAdmin, updateAdminSchema } from 'src/routes/admins/updateAdmin';

export const adminRoutes: FastifyPluginAsync = async function (app, _) {
  app.post<CreateAdminSchema>(
    '',
    {
      schema: createAdminSchema,
    },
    createAdmin
  );

  app.get(
    '',
    {
      schema: getAdminsSchema,
    },
    getAdmins
  );

  app.get(
    '/:id',
    {
      schema: getAdminSchema,
    },
    getAdmin
  );

  app.put(
    '/:id',
    {
      schema: updateAdminSchema,
    },
    updateAdmin
  );

  app.delete(
    '/:id',
    {
      schema: deleteAdminSchema,
    },
    deleteAdmin
  );
};
