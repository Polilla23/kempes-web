import { FastifyInstance } from 'fastify'
import { eventsSchemas } from '@/features/events/events.schemas'

export const eventRoutes = async (fastify: FastifyInstance) => {
  const eventController = (fastify as any).container.resolve('eventController')

  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: eventsSchemas.create,
    handler: eventController.create.bind(eventController),
  })

  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: eventsSchemas.findAll,
    handler: eventController.findAll.bind(eventController),
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: eventsSchemas.findOne,
    handler: eventController.findOne.bind(eventController),
  })

  // Nested resource: GET /events/matches/:id (events for a specific match)
  fastify.get('/matches/:id', {
    preHandler: [fastify.authenticate],
    schema: eventsSchemas.findByMatchId,
    handler: eventController.findByMatchId.bind(eventController),
  })

  // Nested resource: GET /events/players/:id (events for a specific player)
  fastify.get('/players/:id', {
    preHandler: [fastify.authenticate],
    schema: eventsSchemas.findByPlayerId,
    handler: eventController.findByPlayerId.bind(eventController),
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    schema: eventsSchemas.update,
    handler: eventController.update.bind(eventController),
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: eventsSchemas.delete,
    handler: eventController.delete.bind(eventController),
  })
}
