import { FastifyInstance } from 'fastify'
import { userRoutes } from '@/features/users/users.routes'
import { myAccountRoutes } from '@/features/me/me.routes'
import { playerRoutes } from '@/features/players/players.routes'
import { clubRoutes } from '@/features/clubs/clubs.routes'
import { competitionRoutes } from '@/features/competitions/competitions.routes'
import { competitionTypeRoutes } from '@/features/competition-types/competition-types.routes'
import { fixtureRoutes } from '@/features/fixtures/fixtures.routes'
import { eventRoutes } from '@/features/events/events.routes'
import { eventTypeRoutes } from '@/features/event-types/event-types.routes'
import { seasonRoutes } from '@/features/seasons/seasons.routes'
import { salaryRateRoutes } from '@/features/salary-rates/salary-rates.routes'

/**
 * Plugin principal de rutas con prefijo /api/v1
 * Registra todas las rutas de la aplicación bajo el prefijo /api/v1
 */
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
      instance.register(eventTypeRoutes, { prefix: '/event-types' })
      instance.register(seasonRoutes, { prefix: '/seasons' })
      instance.register(salaryRateRoutes, { prefix: '/salary-rates' })

      instance.get('/health', async () => ({ status: 'ok', timestamp: new Date() }))

      done()
    },
    { prefix: '/api/v1' }
  )
}
