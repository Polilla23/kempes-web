// Tipos de Response para operaciones y respuestas estandarizadas

export type FinishMatchResponse = {
  success: boolean
  match: any
  dependentMatchesUpdated: number
  updatedMatches: any[]
}

export type GroupStageFixtureResponse = {
  success: boolean
  matchesCreated: number
  competitionId: string
}

export type LeagueFixtureResponse = {
  success: boolean
  matchesCreated: number
  competitionId: string
}

export type KnockoutFixtureResponse = {
  success: boolean
  matchesCreated: number
  competitionId: string
}

export type SuccessResponseDTO<T = any> = {
  data: T
  message?: string
  timestamp: string
}

export type ErrorResponseDTO = {
  error: string
  message: string
  details?: any
  timestamp: string
  path?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    currentPage: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  message?: string
  timestamp: string
}