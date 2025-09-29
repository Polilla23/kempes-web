import { FastifyInstance } from 'fastify'
import { competitionSchemas } from '../schemas/competition.schema'

export const competitionRoutes = async (fastify: FastifyInstance) => {
  const competitionController = (fastify as any).container.resolve('competitionController')
  fastify.post('/create', {
    preHandler: [fastify.authenticate],
    schema: competitionSchemas.create,
    handler: competitionController.create.bind(competitionController),
  })
  fastify.get('/findAll', {
    preHandler: [fastify.authenticate],
    schema: competitionSchemas.findAll,
    handler: competitionController.findAll.bind(competitionController),
  })
  fastify.get('/findOne/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionSchemas.findOne,
    handler: competitionController.findOne.bind(competitionController),
  })
  fastify.patch('/update/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionSchemas.update,
    handler: competitionController.update.bind(competitionController),
  })
  fastify.delete('/delete/:id', {
    preHandler: [fastify.authenticate],
    schema: competitionSchemas.delete,
    handler: competitionController.delete.bind(competitionController),
  })
}
