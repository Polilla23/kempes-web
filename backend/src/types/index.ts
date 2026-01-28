// Barrel export para todos los tipos de la aplicación

export * from './fastify.types'
export * from './response.types'
export * from './dto.types'
export * from './domain.types'

// Re-exports de tipos por feature (nueva estructura)
export * from './features/users.types'
export * from './features/clubs.types'
export * from './features/players.types'
export * from './features/competition-types.types'
export * from './features/events.types'
export * from './features/fixtures.types'
export * from './features/salary-rates.types'
export * from './features/news.types'
export * from './features/storage.types'
