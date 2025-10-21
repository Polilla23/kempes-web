import { FastifyInstance } from 'fastify'
import { authorize } from '@/features/core/middleware/authorize'
import { myAccountSchemas } from '@/features/me/me.schemas'

export async function myAccountRoutes(fastify: FastifyInstance) {
  const accountController = fastify.container.resolve('myAccountController')

  fastify.get('/', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getUserData,
    handler: accountController.getUserData.bind(accountController),
  })

  fastify.get('/me', {
    preHandler: [fastify.authenticate],
    schema: myAccountSchemas.getBasicUserData,
    handler: async (req, reply) => {
      const user = req.user as { id: string; role: string }
      return { data: { id: user.id, role: user.role } }
    },
  })
}
