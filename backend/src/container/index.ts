import { createContainer, asClass, asValue } from 'awilix'
import { UserService } from '../services/user.service'
import { UserRepository } from '../repositories/user.repository'
import { UserController } from '../controllers/user.controller'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { EmailService } from '../services/email.service'

export function createDepencyContainer(fastify: FastifyInstance) {
  const prisma = new PrismaClient()
  const container = createContainer()

  container.register({
    prisma: asValue(prisma),
    userRepository: asClass(UserRepository).singleton(),
    userController: asClass(UserController).singleton(),
    userService: asClass(UserService).singleton(),
    emailService: asClass(EmailService).singleton(),
  })

  prisma.$connect()
    .then(() => console.log('Connected to DB'))
    .catch((e) => {
      console.error('Failed to connect to DB', e)
      process.exit(1)
    })
  return container
}
