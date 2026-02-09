import { FastifyInstance } from 'fastify'
import { newsSchemas } from './news.schema'
import { commentSchemas } from '@/features/comments/comments.schema'

export const newsRoutes = async (fastify: FastifyInstance) => {
  const newsController = (fastify as any).container.resolve('newsController')
  const commentController = (fastify as any).container.resolve('commentController')

  // Public routes (no authentication needed for reading published news)
  fastify.get('/', {
    schema: newsSchemas.getAll,
    handler: newsController.getAll.bind(newsController),
  })

  fastify.get('/:id', {
    schema: newsSchemas.getById,
    handler: newsController.getById.bind(newsController),
  })

  // Protected routes (authentication required)
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: newsSchemas.create,
    handler: newsController.create.bind(newsController),
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    schema: newsSchemas.update,
    handler: newsController.update.bind(newsController),
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: newsSchemas.delete,
    handler: newsController.delete.bind(newsController),
  })

  fastify.post('/:id/images', {
    preHandler: [fastify.authenticate],
    schema: newsSchemas.addImage,
    handler: newsController.addImage.bind(newsController),
  })

  fastify.delete('/:id/images', {
    preHandler: [fastify.authenticate],
    schema: newsSchemas.removeImage,
    handler: newsController.removeImage.bind(newsController),
  })

  fastify.post('/:id/like', {
    preHandler: [fastify.authenticate],
    schema: newsSchemas.toggleLike,
    handler: newsController.toggleLike.bind(newsController),
  })

  // Comment routes
  fastify.get('/:id/comments', {
    schema: commentSchemas.getByNewsId,
    handler: commentController.getByNewsId.bind(commentController),
  })

  fastify.post('/:id/comments', {
    preHandler: [fastify.authenticate],
    schema: commentSchemas.create,
    handler: commentController.create.bind(commentController),
  })

  fastify.delete('/:id/comments/:commentId', {
    preHandler: [fastify.authenticate],
    schema: commentSchemas.delete,
    handler: commentController.delete.bind(commentController),
  })
}
