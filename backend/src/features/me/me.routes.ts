import { FastifyInstance } from 'fastify'
import { authorize } from '@/features/core/middleware/authorize'
import { myAccountSchemas } from '@/features/me/me.schemas'
import { Response } from '@/features/core'

export async function myAccountRoutes(fastify: FastifyInstance) {
  const accountController = fastify.container.resolve('myAccountController')

  // Basic user profile endpoint (just id and role for auth checks)
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: myAccountSchemas.getBasicUserData,
    handler: async (req, reply) => {
      const user = req.user as { id: string; role: string }
      return Response.success(reply, { id: user.id, role: user.role }, 'Profile fetched successfully')
    },
  })

  // Full user account data endpoint
  fastify.get('/account', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getUserData,
    handler: accountController.getUserData.bind(accountController),
  })

  // User's club data
  fastify.get('/club', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getUserClub,
    handler: accountController.getUserClub.bind(accountController),
  })

  // User's current league with standings
  fastify.get('/league', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getUserLeague,
    handler: accountController.getUserLeague.bind(accountController),
  })

  // User's recent matches
  fastify.get('/matches/recent', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getUserRecentMatches,
    handler: accountController.getUserRecentMatches.bind(accountController),
  })

  // User's upcoming matches
  fastify.get('/matches/upcoming', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getUserUpcomingMatches,
    handler: accountController.getUserUpcomingMatches.bind(accountController),
  })

  // Global recent matches (for carousel - no user context needed beyond auth)
  fastify.get('/fixtures/recent', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getRecentMatches,
    handler: accountController.getRecentMatches.bind(accountController),
  })

  // Season stats (for home page header)
  fastify.get('/season/stats', {
    preHandler: [fastify.authenticate, authorize(['ADMIN', 'USER'])],
    schema: myAccountSchemas.getSeasonStats,
    handler: accountController.getSeasonStats.bind(accountController),
  })
}
