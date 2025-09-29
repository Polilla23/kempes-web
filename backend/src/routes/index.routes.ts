import { FastifyInstance } from 'fastify'
import { userRoutes } from './user.routes'
import { myAccountRoutes } from './myAccount.routes'
import { playerRoutes } from './player.routes'
import { clubRoutes } from './club.routes'
import { competitionRoutes } from './competition.routes'
import { competitionTypeRoutes } from './competitionType.routes'

export const routes = async (fastify: FastifyInstance) => {
  fastify.register(userRoutes, { prefix: '/user' })
  fastify.register(myAccountRoutes, { prefix: '/myaccount' })
  fastify.register(playerRoutes, { prefix: '/player' })
  fastify.register(clubRoutes, { prefix: '/club' })
  fastify.register(competitionRoutes, { prefix: '/competition' })
  fastify.register(competitionTypeRoutes, { prefix: '/competitiontype' })
}
