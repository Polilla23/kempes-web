import { FastifyInstance } from 'fastify'
import { playerSchemas } from '../schemas/player.schema'

export const playerRoutes = async (fastify: FastifyInstance) => {
  const playerController = fastify.container.resolve('playerController')

  fastify.post('/create', {
    schema: playerSchemas.create,
    handler: playerController.create.bind(playerController),
  })

  fastify.get('/findAll', {
    schema: playerSchemas.findAll,
    handler: playerController.findAll.bind(playerController),
  })

  fastify.get('/find/:id', {
    schema: playerSchemas.findOne,
    handler: playerController.findOne.bind(playerController),
  })

  fastify.patch('/update/:id', {
    schema: playerSchemas.update,
    handler: playerController.update.bind(playerController),
  })

  fastify.delete('/delete/:id', {
    schema: playerSchemas.delete,
    handler: playerController.delete.bind(playerController),
  })

  fastify.post('/bulkCreate', {
    // schema: playerSchemas.bulkCreate,
    handler: playerController.uploadCSVFile.bind(playerController),
  })
}
