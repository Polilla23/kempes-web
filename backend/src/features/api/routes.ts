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
import { standingsRoutes } from '@/features/seasons/standings.routes'
import { salaryRateRoutes } from '@/features/salary-rates/salary-rates.routes'
<<<<<<< HEAD
import { storageRoutes } from '@/features/storage/storage.routes'
import { newsRoutes } from '@/features/news/news.routes'
=======
>>>>>>> f129129e099849525877b379b8f74448bef10357
import { seasonHalfRoutes } from '@/features/season-halves/season-halves.routes'
import { transferWindowRoutes } from '@/features/transfer-windows/transfer-windows.routes'
import { transferRoutes } from '@/features/transfers/transfers.routes'
import { financeRoutes } from '@/features/finances/finances.routes'

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
      instance.register(standingsRoutes, { prefix: '/standings' })
      instance.register(salaryRateRoutes, { prefix: '/salary-rates' })
<<<<<<< HEAD
      instance.register(storageRoutes, { prefix: '/storage' })
      instance.register(newsRoutes, { prefix: '/news' })
=======
>>>>>>> f129129e099849525877b379b8f74448bef10357
      instance.register(seasonHalfRoutes, { prefix: '/season-halves' })
      instance.register(transferWindowRoutes, { prefix: '/transfer-windows' })
      instance.register(transferRoutes, { prefix: '/transfers' })
      instance.register(financeRoutes, { prefix: '/finances' })

      instance.get('/health', async () => ({ status: 'ok', timestamp: new Date() }))

      done()
    },
    { prefix: '/api/v1' }
  )
}

