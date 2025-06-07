import { FastifyInstance } from 'fastify'
import { userSchemas } from '../schemas/user.schema'

export const userRoutes = async (fastify: FastifyInstance) => {
  const userController = (fastify as any).container.resolve('userController')
  // fastify.post('/login', { schema: userSchemas.login })
  fastify.post('/register', {
    schema: userSchemas.register,
    handler: userController.register.bind(userController),
  })

  fastify.get('/findAll', {
    schema: userSchemas.findAll,
    handler: userController.findAll.bind(userController),
  })

  fastify.patch('/update/:id', {
    schema: userSchemas.update,
    handler: userController.update.bind(userController),
  })
  
  fastify.delete('/delete/:id', {
    schema: userSchemas.delete,
    handler: userController.delete.bind(userController),
  })
  
}
