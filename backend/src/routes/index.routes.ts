import { FastifyInstance } from 'fastify'
import { userRoutes } from './user.routes'

export const routes = async (fastify: FastifyInstance) => {
  fastify.register(userRoutes, { prefix: '/user' })
}
