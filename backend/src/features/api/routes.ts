import { FastifyInstance } from 'fastify'
import { userRoutes } from '@/features/users/users.routes'
import { myAccountRoutes } from '@/features/me/me.routes'
import { playerRoutes } from '@/features/players/players.routes'
import { clubRoutes } from '@/features/clubs/clubs.routes'
import { competitionRoutes } from '@/features/competitions/competitions.routes'
import { competitionTypeRoutes } from '@/features/competition-types/competition-types.routes'
import { fixtureRoutes } from '@/features/fixtures/fixtures.routes'
import { eventRoutes } from '@/features/events/events.routes'

export const routes = async (fastify: FastifyInstance) => {
  fastify.register(userRoutes, { prefix: '/users' })
  fastify.register(myAccountRoutes, { prefix: '/me' })
  fastify.register(playerRoutes, { prefix: '/players' })
  fastify.register(clubRoutes, { prefix: '/clubs' })
  fastify.register(competitionRoutes, { prefix: '/competitions' })
  fastify.register(competitionTypeRoutes, { prefix: '/competition-types' })
  fastify.register(fixtureRoutes, { prefix: '/fixtures' })
  fastify.register(eventRoutes, { prefix: '/events' })
}

export default async function (app: FastifyInstance) {
  app.register(
    (instance, opts, done) => {
      instance.register(userRoutes, { prefix: '/users' })
      instance.register(myAccountRoutes, { prefix: '/me' })
      instance.register(playerRoutes, { prefix: '/players' })
      instance.register(clubRoutes, { prefix: '/clubs' })
      instance.register(competitionRoutes, { prefix: '/competitions' })
      instance.register(competitionTypeRoutes, { prefix: '/competition-types' })
      instance.register(fixtureRoutes, { prefix: '/fixtures' })
      instance.register(eventRoutes, { prefix: '/events' })

      instance.get('/health', async () => ({ status: 'ok', timestamp: new Date() }))

      done()
    },
    { prefix: '/api/v1' }
  )
}
