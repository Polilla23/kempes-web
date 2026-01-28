import { FastifyInstance } from 'fastify'
import { storageSchemas } from './storage.schema'

export const storageRoutes = async (fastify: FastifyInstance) => {
  const storageController = (fastify as any).container.resolve(
    'storageController'
  )

  fastify.post('/upload', {
    preHandler: [fastify.authenticate],
    schema: storageSchemas.upload,
    handler: storageController.upload.bind(storageController),
  })

  fastify.delete('/:fileId', {
    preHandler: [fastify.authenticate],
    schema: storageSchemas.delete,
    handler: storageController.delete.bind(storageController),
  })

  fastify.get('/:fileId/metadata', {
    preHandler: [fastify.authenticate],
    schema: storageSchemas.getMetadata,
    handler: storageController.getMetadata.bind(storageController),
  })
}
