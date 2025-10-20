import { FastifyInstance } from 'fastify'
import { clubsSchemas } from '@/features/clubs/clubs.schema'

export const clubRoutes = async (fastify: FastifyInstance) => {
  const clubController = (fastify as any).container.resolve('clubController')
  fastify.post('/', {
    preHandler: [fastify.authenticate],
  schema: clubsSchemas.create,
    handler: clubController.create.bind(clubController),
  })
  fastify.get('/', {
    preHandler: [fastify.authenticate],
  schema: clubsSchemas.findAll,
    handler: clubController.findAll.bind(clubController),
  })
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
  schema: clubsSchemas.findOne,
    handler: clubController.findOne.bind(clubController),
  })
  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
  schema: clubsSchemas.update,
    handler: clubController.update.bind(clubController),
  })
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
  schema: clubsSchemas.delete,
    handler: clubController.delete.bind(clubController),
  })
}
