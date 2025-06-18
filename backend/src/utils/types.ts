import 'fastify'
import { AwilixContainer } from 'awilix'
import { RoleType } from '@prisma/client'
import { JWT } from '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT
  }

  interface FastifyInstance {
    container: AwilixContainer
    authenticate: any
    jwt: JWT
  }
}

export type RegisterUserInput = {
  email: string
  password: string
  role?: RoleType
}

declare module '@fastify/jwt' {
  interface fastifyJwt {
    payload: {
      id: string
      role: string
    }
  }
}

export interface Token {
  access_token: string
  token_type: string
  expires_in: number
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
