import { FastifyInstance } from 'fastify'
import { competitionTypesSchemas } from '@/features/competition-types/competition-types.schemas'

export const competitionTypeRoutes = async (fastify: FastifyInstance) => {
  const competitionTypeController = (fastify as any).container.resolve('competitionTypeController')
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: competitionTypesSchemas.create,
    handler: competitionTypeController.create.bind(competitionTypeController),
  })
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: competitionTypesSchemas.findAll,
    handler: competitionTypeController.findAll.bind(competitionTypeController),
  })
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionTypesSchemas.findOne,
    handler: competitionTypeController.findOne.bind(competitionTypeController),
  })
  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionTypesSchemas.update,
    handler: competitionTypeController.update.bind(competitionTypeController),
  })
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionTypesSchemas.delete,
    handler: competitionTypeController.delete.bind(competitionTypeController),
  })
}
