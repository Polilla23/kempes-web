import { FastifyInstance } from 'fastify'
import { authorize } from '../middleware/authorize'
import { myAccountSchemas } from '../schemas/myAccount.schemas'

export async function myAccountRoutes(fastify: FastifyInstance) {
  const accountController = fastify.container.resolve('myAccountController')

  fastify.get('/', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getUserData,
    handler: accountController.getUserData.bind(accountController),
  })

  fastify.get('/me', {
    preHandler: [fastify.authenticate],
    handler: async (req, reply) => {      
      const user = req.user as { id: string, role: string }
      return { id: user.id, role: user.role }
    }
  })
}
