// Dependency Injection Container Setup

//Imports
import { createContainer, asClass, asValue } from 'awilix'
import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { UserService } from '@/features/users/users.service'
import { UserRepository } from '@/features/users/users.repository'
import { UserController } from '@/features/users/users.controller'
import { EmailService } from '@/features/core/email/email.service'
import { MyAccountService } from '@/features/me/me.service'
import { MyAccountController } from '@/features/me/me.controller'
import { PlayerRepository } from '@/features/players/players.repository'
import { PlayerController } from '@/features/players/players.controller'
import { PlayerService } from '@/features/players/players.service'
import { ClubRepository } from '@/features/clubs/clubs.repository'
import { ClubController } from '@/features/clubs/clubs.controller'
import { ClubService } from '@/features/clubs/clubs.service'
import { CompetitionTypeRepository } from '@/features/competition-types/competition-types.repository'
import { CompetitionTypeController } from '@/features/competition-types/competition-types.controller'
import { CompetitionTypeService } from '@/features/competition-types/competition-types.service'
import { CompetitionRepository } from '@/features/competitions/competitions.repository'
import { CompetitionController } from '@/features/competitions/competitions.controller'
import { CompetitionService } from '@/features/competitions/competitions.service'
import { FixtureRepository } from '@/features/fixtures/fixtures.repository'
import { FixtureService } from '@/features/fixtures/fixtures.service'
import { FixtureController } from '@/features/fixtures/fixtures.controller'
import { EventRepository } from '@/features/events/events.repository'
import { EventController } from '@/features/events/events.controller'
import { EventService } from '@/features/events/events.service'
import { EventTypeRepository } from '@/features/event-types/event-types.repository'
import { EventTypeController } from '@/features/event-types/event-types.controller'
import { EventTypeService } from '@/features/event-types/event-types.service'
import { SeasonRepository } from '@/features/seasons/seasons.repository'
import { SeasonController } from '@/features/seasons/seasons.controller'
import { SeasonService } from '@/features/seasons/seasons.service'
import { SalaryRateRepository } from '@/features/salary-rates/salary-rates.repository'
import { SalaryRateController } from '@/features/salary-rates/salary-rates.controller'
import { SalaryRateService } from '@/features/salary-rates/salary-rates.service'

export function createDepencyContainer(fastify: FastifyInstance) {
  const prisma = new PrismaClient()
  const container = createContainer()

  container.register({
    prisma: asValue(prisma),

    userRepository: asClass(UserRepository).singleton(),
    playerRepository: asClass(PlayerRepository).singleton(),
    clubRepository: asClass(ClubRepository).singleton(),
    competitionTypeRepository: asClass(CompetitionTypeRepository).singleton(),
    competitionRepository: asClass(CompetitionRepository).singleton(),
    fixtureRepository: asClass(FixtureRepository).singleton(),
    eventRepository: asClass(EventRepository).singleton(),
    eventTypeRepository: asClass(EventTypeRepository).singleton(),
    seasonRepository: asClass(SeasonRepository).singleton(),
    salaryRateRepository: asClass(SalaryRateRepository).singleton(),

    userController: asClass(UserController).singleton(),
    myAccountController: asClass(MyAccountController).singleton(),
    playerController: asClass(PlayerController).singleton(),
    clubController: asClass(ClubController).singleton(),
    competitionTypeController: asClass(CompetitionTypeController).singleton(),
    competitionController: asClass(CompetitionController).singleton(),
    fixtureController: asClass(FixtureController).singleton(),
    eventController: asClass(EventController).singleton(),
    eventTypeController: asClass(EventTypeController).singleton(),
    seasonController: asClass(SeasonController).singleton(),
    salaryRateController: asClass(SalaryRateController).singleton(),

    userService: asClass(UserService).singleton(),
    myAccountService: asClass(MyAccountService).singleton(),
    playerService: asClass(PlayerService).singleton(),
    clubService: asClass(ClubService).singleton(),
    competitionTypeService: asClass(CompetitionTypeService).singleton(),
    competitionService: asClass(CompetitionService).singleton(),
    fixtureService: asClass(FixtureService).singleton(),
    eventService: asClass(EventService).singleton(),
    eventTypeService: asClass(EventTypeService).singleton(),
    seasonService: asClass(SeasonService).singleton(),
    salaryRateService: asClass(SalaryRateService).singleton(),

    emailService: asClass(EmailService).singleton(),

    jwtService: asValue(fastify.jwt),
    fastify: asValue(fastify),
  })

  prisma
    .$connect()
    .then(() => console.log('Connected to DB'))
    .catch((e: Error) => {
      console.error('Failed to connect to DB', e)
      process.exit(1)
    })

  return container
}
