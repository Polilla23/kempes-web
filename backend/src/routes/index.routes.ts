import { FastifyInstance } from 'fastify'
import { userRoutes } from './user.routes'
import { myAccountRoutes } from './myAccount.routes'

export const routes = async (fastify: FastifyInstance) => {
  fastify.register(userRoutes, { prefix: '/user' })
  fastify.register(myAccountRoutes, { prefix: '/myaccount' })
}
