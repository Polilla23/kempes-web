import { FastifyInstance } from 'fastify'
import { userSchemas } from '../schemas/user.schema'

export const userRoutes = async (fastify: FastifyInstance) => {
  const userController = (fastify as any).container.resolve('userController')
  // fastify.get()
  // fastify.post('/login', { schema: userSchemas.login })
  fastify.post('/register', {
    schema: userSchemas.register,
    handler: userController.register.bind(userController),
  })
}
