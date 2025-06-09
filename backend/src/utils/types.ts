import 'fastify'
import { AwilixContainer } from 'awilix'
import { RoleType } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    container: AwilixContainer
  }
}

export type RegisterUserInput = {
  email: string
  password: string
  role?: RoleType
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
