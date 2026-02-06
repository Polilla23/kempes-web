import { FastifyInstance } from 'fastify'
import { transferWindowsSchemas } from '@/features/transfer-windows/transfer-windows.schema'

export const transferWindowRoutes = async (fastify: FastifyInstance) => {
  const transferWindowController = (fastify as any).container.resolve('transferWindowController')

  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.findAll,
    handler: transferWindowController.findAll.bind(transferWindowController),
  })

  fastify.get('/active', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.findActive,
    handler: transferWindowController.findActive.bind(transferWindowController),
  })

  fastify.get('/is-open', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.isOpen,
    handler: transferWindowController.isOpen.bind(transferWindowController),
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.findOne,
    handler: transferWindowController.findOne.bind(transferWindowController),
  })

  fastify.get('/season-half/:seasonHalfId', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.findBySeasonHalfId,
    handler: transferWindowController.findBySeasonHalfId.bind(transferWindowController),
  })

  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.create,
    handler: transferWindowController.create.bind(transferWindowController),
  })

  fastify.patch('/:id/open', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.open,
    handler: transferWindowController.open.bind(transferWindowController),
  })

  fastify.patch('/:id/close', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.close,
    handler: transferWindowController.close.bind(transferWindowController),
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.update,
    handler: transferWindowController.update.bind(transferWindowController),
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: transferWindowsSchemas.delete,
    handler: transferWindowController.delete.bind(transferWindowController),
  })
}
