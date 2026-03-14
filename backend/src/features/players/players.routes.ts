import { FastifyInstance } from 'fastify'
import { playersSchemas } from '@/features/players/players.schemas'

export const playerRoutes = async (fastify: FastifyInstance) => {
  const playerController = fastify.container.resolve('playerController')

  fastify.post('/', {
    schema: playersSchemas.create,
    handler: playerController.create.bind(playerController),
  })

  fastify.get('/', {
    schema: playersSchemas.findAll,
    handler: playerController.findAll.bind(playerController),
  })

  fastify.get('/:id', {
    schema: playersSchemas.findOne,
    handler: playerController.findOne.bind(playerController),
  })

  fastify.get('/:id/career', {
    handler: playerController.getCareer.bind(playerController),
  })

  fastify.get('/:id/season-stats', {
    handler: playerController.getSeasonStats.bind(playerController),
  })

  fastify.get('/:id/titles', {
    handler: playerController.getTitles.bind(playerController),
  })

  fastify.get('/:id/transfers', {
    handler: playerController.getTransfers.bind(playerController),
  })

  fastify.patch('/:id', {
    schema: playersSchemas.update,
    handler: playerController.update.bind(playerController),
  })

  fastify.delete('/:id', {
    schema: playersSchemas.delete,
    handler: playerController.delete.bind(playerController),
  })

  fastify.post('/bulk', {
    schema: playersSchemas.bulkCreate,
    handler: playerController.uploadCSVFile.bind(playerController),
  })

  fastify.post('/update-overalls', {
    handler: playerController.bulkUpdateOveralls.bind(playerController),
  })
}
