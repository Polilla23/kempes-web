import { createContainer, asClass, asValue } from 'awilix'
import { UserService } from '../services/user.service'
import { UserRepository } from '../repositories/user.repository'
import { UserController } from '../controllers/user.controller'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'

export function createDepencyContainer(fastify: FastifyInstance) {
  const prisma = new PrismaClient()
  const container = createContainer()

  container.register({
    userRepository: asClass(UserRepository).scoped(),
    userController: asClass(UserController).scoped(),
    userService: asClass(UserService).scoped(),
    prisma: asValue(prisma),
  })
  return container
}
