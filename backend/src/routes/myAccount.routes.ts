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

  fastify.get('/profile', {
    preHandler: [fastify.authenticate],
    schema: myAccountSchemas.getUserRole,
    handler: accountController.getProfile.bind(accountController),
  })
}
