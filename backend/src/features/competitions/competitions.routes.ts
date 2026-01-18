import { FastifyInstance } from 'fastify'
import { competitionsSchemas } from '@/features/competitions/competitions.schemas'

export const competitionRoutes = async (fastify: FastifyInstance) => {
  const competitionController = (fastify as any).container.resolve('competitionController')
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    // Schema deshabilitado intencionalmente:
    // - El schema es muy complejo (800+ líneas con oneOf estrictos)
    // - La validación real se hace en validateCompetitionRules() del service
    // - Fastify oneOf es muy restrictivo y rechaza payloads válidos
    // schema: competitionsSchemas.create,
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
