import { createContainer, asClass, asValue } from 'awilix'
import { UserService } from '../services/user.service'
import { UserRepository } from '../repositories/user.repository'
import { UserController } from '../controllers/user.controller'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { EmailService } from '../services/email.service'
import { MyAccountService } from '../services/myAccount.service'
import { myAccountController } from '../controllers/myAccount.controller'
import { PlayerRepository } from '../repositories/player.repository'
import { PlayerController } from '../controllers/player.controller'
import { PlayerService } from '../services/player.service'
import { ClubRepository } from '../repositories/club.repository'
import { ClubController } from '../controllers/club.controller'
import { ClubService } from '../services/club.service'

export function createDepencyContainer(fastify: FastifyInstance) {
  const prisma = new PrismaClient()
  const container = createContainer()

  container.register({
    prisma: asValue(prisma),

    userRepository: asClass(UserRepository).singleton(),
    playerRepository: asClass(PlayerRepository).singleton(),
    clubRepository: asClass(ClubRepository).singleton(),

    userController: asClass(UserController).singleton(),
    myAccountController: asClass(myAccountController).singleton(),
    playerController: asClass(PlayerController).singleton(),
    clubController: asClass(ClubController).singleton(),

    userService: asClass(UserService).singleton(),
    myAccountService: asClass(MyAccountService).singleton(),
    playerService: asClass(PlayerService).singleton(),
    clubService: asClass(ClubService).singleton(),

    emailService: asClass(EmailService).singleton(),

    jwtService: asValue(fastify.jwt),
    fastify: asValue(fastify),
  })

  prisma
    .$connect()
    .then(() => console.log('Connected to DB'))
    .catch((e) => {
      console.error('Failed to connect to DB', e)
      process.exit(1)
    })

  return container
}
