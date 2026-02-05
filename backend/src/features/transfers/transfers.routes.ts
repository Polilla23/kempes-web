import { FastifyInstance } from 'fastify'
import { transfersSchemas } from '@/features/transfers/transfers.schema'

export const transferRoutes = async (fastify: FastifyInstance) => {
  const transferController = (fastify as any).container.resolve('transferController')

  // GET routes
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.findAll,
    handler: transferController.findAll.bind(transferController),
  })

  fastify.get('/active-loans', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.findActiveLoans,
    handler: transferController.findActiveLoans.bind(transferController),
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.findOne,
    handler: transferController.findOne.bind(transferController),
  })

  fastify.get('/player/:playerId', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.findByPlayerId,
    handler: transferController.findByPlayerId.bind(transferController),
  })

  fastify.get('/club/:clubId', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.findByClubId,
    handler: transferController.findByClubId.bind(transferController),
  })

  fastify.get('/club/:clubId/roster-count', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.getRosterCount,
    handler: transferController.getRosterCount.bind(transferController),
  })

  fastify.get('/pending-confirmations/:clubId', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.findPendingConfirmations,
    handler: transferController.findPendingConfirmations.bind(transferController),
  })

  // POST routes
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.create,
    handler: transferController.create.bind(transferController),
  })

  fastify.post('/loan', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.createLoan,
    handler: transferController.createLoan.bind(transferController),
  })

  fastify.post('/auction', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.createAuction,
    handler: transferController.createAuction.bind(transferController),
  })

  fastify.post('/free-agent', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.signFreeAgent,
    handler: transferController.signFreeAgent.bind(transferController),
  })

  fastify.post('/inactive', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.markInactive,
    handler: transferController.markInactive.bind(transferController),
  })

  // PATCH routes
  fastify.patch('/:id/complete', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.complete,
    handler: transferController.complete.bind(transferController),
  })

  fastify.patch('/:id/cancel', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.cancel,
    handler: transferController.cancel.bind(transferController),
  })

  fastify.post('/:id/approve', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.approve,
    handler: transferController.approve.bind(transferController),
  })

  fastify.post('/:id/reject', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.reject,
    handler: transferController.reject.bind(transferController),
  })

  // DELETE route
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: transfersSchemas.delete,
    handler: transferController.delete.bind(transferController),
  })
}
