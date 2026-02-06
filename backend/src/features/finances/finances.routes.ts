import { FastifyInstance } from 'fastify'
import { financesSchemas } from '@/features/finances/finances.schema'

export const financeRoutes = async (fastify: FastifyInstance) => {
  const financeController = (fastify as any).container.resolve('financeController')

  // ==================== Transactions ====================
  fastify.get('/transactions', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.findAllTransactions,
    handler: financeController.findAllTransactions.bind(financeController),
  })

  fastify.get('/transactions/:id', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.findTransaction,
    handler: financeController.findTransaction.bind(financeController),
  })

  fastify.get('/transactions/club/:clubId', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.findTransactionsByClub,
    handler: financeController.findTransactionsByClub.bind(financeController),
  })

  fastify.post('/transactions', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.createTransaction,
    handler: financeController.createTransaction.bind(financeController),
  })

  // ==================== Balances ====================
  fastify.get('/balance/:clubId', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.getClubBalance,
    handler: financeController.getClubBalance.bind(financeController),
  })

  fastify.get('/balance/:clubId/history', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.getAllClubBalances,
    handler: financeController.getAllClubBalances.bind(financeController),
  })

  fastify.get('/balance/season-half/:seasonHalfId', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.getSeasonHalfBalances,
    handler: financeController.getSeasonHalfBalances.bind(financeController),
  })

  fastify.post('/balance/initialize', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.initializeClubBalance,
    handler: financeController.initializeClubBalance.bind(financeController),
  })

  // ==================== Prizes ====================
  fastify.get('/prizes', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.findAllPrizes,
    handler: financeController.findAllPrizes.bind(financeController),
  })

  fastify.get('/prizes/competition-type/:competitionTypeId', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.findPrizesByCompetitionType,
    handler: financeController.findPrizesByCompetitionType.bind(financeController),
  })

  fastify.get('/prizes/:id', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.findPrize,
    handler: financeController.findPrize.bind(financeController),
  })

  fastify.post('/prizes', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.createPrize,
    handler: financeController.createPrize.bind(financeController),
  })

  fastify.patch('/prizes/:id', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.updatePrize,
    handler: financeController.updatePrize.bind(financeController),
  })

  fastify.delete('/prizes/:id', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.deletePrize,
    handler: financeController.deletePrize.bind(financeController),
  })

  fastify.post('/prizes/award', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.awardPrize,
    handler: financeController.awardPrize.bind(financeController),
  })

  // ==================== Fines & Bonuses ====================
  fastify.post('/fine', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.recordFine,
    handler: financeController.recordFine.bind(financeController),
  })

  fastify.post('/bonus', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.recordBonus,
    handler: financeController.recordBonus.bind(financeController),
  })

  // ==================== Financial Report ====================
  fastify.get('/report/:clubId', {
    preHandler: [fastify.authenticate],
    schema: financesSchemas.getClubFinancialReport,
    handler: financeController.getClubFinancialReport.bind(financeController),
  })
}
