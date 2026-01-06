import { FastifyInstance } from 'fastify'
import { authorize } from '@/features/core/middleware/authorize'
import { myAccountSchemas } from '@/features/me/me.schemas'
import { Response } from '@/features/core'

export async function myAccountRoutes(fastify: FastifyInstance) {
  const accountController = fastify.container.resolve('myAccountController')

  // Basic user profile endpoint (just id and role for auth checks)
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: myAccountSchemas.getBasicUserData,
    handler: async (req, reply) => {
      const user = req.user as { id: string; role: string }
      return Response.success(reply, { id: user.id, role: user.role }, 'Profile fetched successfully')
    },
  })

  // Full user account data endpoint
  fastify.get('/account', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getUserData,
    handler: accountController.getUserData.bind(accountController),
  })
}

