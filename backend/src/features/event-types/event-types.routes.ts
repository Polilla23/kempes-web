import { FastifyInstance } from 'fastify'
import { eventTypesSchemas } from '@/features/event-types/event-types.schemas'

export const eventTypeRoutes = async (fastify: FastifyInstance) => {
    const eventTypeController = (fastify as any).container.resolve('eventTypeController')

    fastify.post('/', {
        preHandler: [fastify.authenticate],
        schema: eventTypesSchemas.create,
        handler: eventTypeController.create.bind(eventTypeController),
    })

    fastify.get('/', {
        preHandler: [fastify.authenticate],
        schema: eventTypesSchemas.findAll,
        handler: eventTypeController.findAll.bind(eventTypeController),
    })

    fastify.get('/:id', {
        preHandler: [fastify.authenticate],
        schema: eventTypesSchemas.findOne,
        handler: eventTypeController.findOne.bind(eventTypeController),
    })

    fastify.patch('/:id', {
        preHandler: [fastify.authenticate],
        schema: eventTypesSchemas.update,
        handler: eventTypeController.update.bind(eventTypeController),
    })

    fastify.delete('/:id', {
        preHandler: [fastify.authenticate],
        schema: eventTypesSchemas.delete,
        handler: eventTypeController.delete.bind(eventTypeController),
    })
}