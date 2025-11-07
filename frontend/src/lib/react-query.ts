// Query keys para React Query
// Centraliza todas las keys para evitar duplicados y facilitar invalidaciones

export const queryKeys = {
  // Users
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,

  // Clubs
  clubs: ['clubs'] as const,
  club: (id: string) => ['clubs', id] as const,

  // Players
  players: ['players'] as const,
  player: (id: string) => ['players', id] as const,

  // Competitions
  competitions: ['competitions'] as const,
  competition: (id: string) => ['competitions', id] as const,

  // Competition Types
  competitionTypes: ['competition-types'] as const,
  competitionType: (id: string) => ['competition-types', id] as const,

  // Fixtures
  fixtures: ['fixtures'] as const,
  fixture: (id: string) => ['fixtures', id] as const,

  // Events
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
}
