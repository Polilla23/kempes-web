import { QueryClient, type DefaultOptions } from '@tanstack/react-query'

// Configuración global para todas las queries y mutations
const queryConfig: DefaultOptions = {
  queries: {
    // Tiempo que los datos son considerados "frescos" (no refetch)
    staleTime: 1 * 60 * 1000, // 1 minuto

    // Tiempo que los datos se mantienen en caché después de no usarse
    gcTime: 5 * 60 * 1000, // 5 minutos (antes era "cacheTime")

    // Refetch automático cuando la ventana recibe foco
    refetchOnWindowFocus: true,

    // Refetch automático cuando se reconecta
    refetchOnReconnect: true,

    // Retry automático en caso de error
    retry: 1, // Solo 1 intento adicional

    // Función de retry personalizada
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Retry en mutations (generalmente false para evitar duplicados)
    retry: false,
  },
}

// Crear instancia de QueryClient
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

// Query Keys - Centraliza las keys para evitar typos
export const queryKeys = {
  // Clubs
  clubs: ['clubs'] as const,
  club: (id: string) => ['clubs', id] as const,

  // Players
  players: ['players'] as const,
  player: (id: string) => ['players', id] as const,

  // Users
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,

  // Competitions
  competitions: ['competitions'] as const,
  competition: (id: string) => ['competitions', id] as const,

  // Competition Types
  competitionTypes: ['competition-types'] as const,
  competitionType: (id: string) => ['competition-types', id] as const,

  // Fixtures
  fixtures: ['fixtures'] as const,
  fixture: (id: string) => ['fixtures', id] as const,
  fixturesByCompetition: (competitionId: string) => ['fixtures', 'competition', competitionId] as const,

  // Events
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  eventsByMatch: (matchId: string) => ['events', 'match', matchId] as const,
  eventsByPlayer: (playerId: string) => ['events', 'player', playerId] as const,

  // Me (user profile)
  me: ['me'] as const,
}
