import 'fastify'
import { AwilixContainer } from 'awilix'

declare module 'fastify' {
  interface FastifyInstance {
    container: AwilixContainer
  }
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
