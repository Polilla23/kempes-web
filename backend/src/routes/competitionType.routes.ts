import { FastifyInstance } from 'fastify'
import { competitionTypeSchemas } from '../schemas/competitionType.schema'

export const competitionTypeRoutes = async (fastify: FastifyInstance) => {
  const competitionTypeController = (fastify as any).container.resolve('competitionTypeController')
  fastify.post('/create', {
    preHandler: [fastify.authenticate],
    schema: competitionTypeSchemas.create,
    handler: competitionTypeController.create.bind(competitionTypeController),
  })
  fastify.get('/findAll', {
    preHandler: [fastify.authenticate],
    schema: competitionTypeSchemas.findAll,
    handler: competitionTypeController.findAll.bind(competitionTypeController),
  })
  fastify.get('/findOne/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionTypeSchemas.findOne,
    handler: competitionTypeController.findOne.bind(competitionTypeController),
  })
  fastify.patch('/update/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionTypeSchemas.update,
    handler: competitionTypeController.update.bind(competitionTypeController),
  })
  fastify.delete('/delete/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionTypeSchemas.delete,
    handler: competitionTypeController.delete.bind(competitionTypeController),
  })
}
