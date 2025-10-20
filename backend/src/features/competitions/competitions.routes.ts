import { FastifyInstance } from 'fastify'
import { competitionsSchemas } from '@/features/competitions/competitions.schemas'

export const competitionRoutes = async (fastify: FastifyInstance) => {
  const competitionController = (fastify as any).container.resolve('competitionController')
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: competitionsSchemas.create,
    handler: competitionController.create.bind(competitionController),
  })
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: competitionsSchemas.findAll,
    handler: competitionController.findAll.bind(competitionController),
  })
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionsSchemas.findOne,
    handler: competitionController.findOne.bind(competitionController),
  })
  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionsSchemas.update,
    handler: competitionController.update.bind(competitionController),
  })
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionsSchemas.delete,
    handler: competitionController.delete.bind(competitionController),
  })
}
