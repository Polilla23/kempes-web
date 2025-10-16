import { FastifyInstance } from 'fastify'
import { eventSchemas } from '../schemas/event.schema'

export const eventRoutes = async (fastify: FastifyInstance) => {
  const eventController = (fastify as any).container.resolve('eventController')
  fastify.post('/create', {
    preHandler: [fastify.authenticate],
    schema: eventSchemas.create,
    handler: eventController.create.bind(eventController),
  })
  fastify.get('/findAll', {
    preHandler: [fastify.authenticate],
    schema: eventSchemas.findAll,
    handler: eventController.findAll.bind(eventController),
  })
  fastify.get('/findOne/:id', {
    preHandler: [fastify.authenticate],
    schema: eventSchemas.findOne,
    handler: eventController.findOne.bind(eventController),
  })
  fastify.patch('/update/:id', {
    preHandler: [fastify.authenticate],
    schema: eventSchemas.update,
    handler: eventController.update.bind(eventController),
  })
  fastify.delete('/delete/:id', {
    preHandler: [fastify.authenticate],
    schema: eventSchemas.delete,
    handler: eventController.delete.bind(eventController),
  })
}
