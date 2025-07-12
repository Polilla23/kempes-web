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

declare global {
  namespace Fastify {
    interface FastifyRequest {
      user: {
        id: string
        role: string
      }
    }
  }
}

export type RegisterUserInput = {
  email: string
  password: string
  role?: RoleType
}

export type RegisterClubInput = {
  name: string
  logo?: string
  userId?: string | null
  isActive?: boolean
}

export type CreatePlayerInput = {
  name: string
  lastName: string
  birthdate: string
  actualClubId: string
  ownerClubId: string
  overall: number
  salary: number
  sofifaId: string
  transfermarktId: string
  isKempesita: boolean
  isActive: boolean
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
