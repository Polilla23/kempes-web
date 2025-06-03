import { FastifyInstance } from 'fastify'
import { userSchemas } from '../schemas/user.schema'
import { UserController } from 'src/controllers/user.controller'

export const userRoutes = async (fastify: FastifyInstance) => {
  const userController = fastify.container.resolve<UserController>('userController')
  // fastify.get()
  // fastify.post('/login', { schema: userSchemas.login })
  fastify.post('/register', {
    schema: userSchemas.register,
    handler: userController.register.bind(userController),
  })
}
