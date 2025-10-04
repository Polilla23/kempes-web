// Dependency Injection Container Setup

//Imports
import { createContainer, asClass, asValue } from 'awilix'
import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { UserService } from '../services/user.service'
import { UserRepository } from '../repositories/user.repository'
import { UserController } from '../controllers/user.controller'
import { EmailService } from '../services/email.service'
import { MyAccountService } from '../services/myAccount.service'
import { myAccountController } from '../controllers/myAccount.controller'
import { PlayerRepository } from '../repositories/player.repository'
import { PlayerController } from '../controllers/player.controller'
import { PlayerService } from '../services/player.service'
import { ClubRepository } from '../repositories/club.repository'
import { ClubController } from '../controllers/club.controller'
import { ClubService } from '../services/club.service'
import { CompetitionTypeRepository } from '../repositories/competitionType.repository'
import { CompetitionTypeController } from '../controllers/competitionType.controller'
import { CompetitionTypeService } from '../services/competitionType.service'
import { CompetitionRepository } from '../repositories/competition.repository'
import { CompetitionController } from '../controllers/competition.controller'
import { CompetitionService } from '../services/competition.service'
import { FixtureRepository } from 'repositories/fixture.repository'
import { FixtureService } from 'services/fixture.service'
import { FixtureController } from 'controllers/fixture.controller'

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

    userController: asClass(UserController).singleton(),
    myAccountController: asClass(myAccountController).singleton(),
    playerController: asClass(PlayerController).singleton(),
    clubController: asClass(ClubController).singleton(),
    competitionTypeController: asClass(CompetitionTypeController).singleton(),
    competitionController: asClass(CompetitionController).singleton(),
    fixtureController: asClass(FixtureController).singleton(),

    userService: asClass(UserService).singleton(),
    myAccountService: asClass(MyAccountService).singleton(),
    playerService: asClass(PlayerService).singleton(),
    clubService: asClass(ClubService).singleton(),
    competitionTypeService: asClass(CompetitionTypeService).singleton(),
    competitionService: asClass(CompetitionService).singleton(),
    fixtureService: asClass(FixtureService).singleton(),

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
