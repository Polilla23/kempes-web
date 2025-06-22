import { FastifyInstance } from 'fastify'
import { clubSchemas } from '../schemas/club.schema'

export const clubRoutes = async (fastify: FastifyInstance) => {
  const clubController = (fastify as any).container.resolve('clubController')
  fastify.post('/create', {
    preHandler: [fastify.authenticate],
    schema: clubSchemas.create,
    handler: clubController.create.bind(clubController),
  })
  fastify.get('/findAll', {
    preHandler: [fastify.authenticate],
    schema: clubSchemas.findAll,
    handler: clubController.findAll.bind(clubController),
  })
  fastify.get('/findOne', {
    preHandler: [fastify.authenticate],
    schema: clubSchemas.findOne,
    handler: clubController.findOne.bind(clubController),
  })
  fastify.patch('/update', {
    preHandler: [fastify.authenticate],
    schema: clubSchemas.update,
    handler: clubController.update.bind(clubController),
  })
  fastify.delete('/delete', {
    preHandler: [fastify.authenticate],
    schema: clubSchemas.delete,
    handler: clubController.delete.bind(clubController),
  })
}
