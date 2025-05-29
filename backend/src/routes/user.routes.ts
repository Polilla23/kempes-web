import { FastifyInstance } from 'fastify'
import { userSchemas } from '../schemas/user.schema'
import { UserController } from '../controllers/user.controller'

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.get()
  fastify.post('/login', { schema: userSchemas.login })
  fastify.post('/register', { schema: userSchemas.register }, handler: (request, reply) => UserController.re)
}
