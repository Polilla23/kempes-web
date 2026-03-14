import { Plazo, PlazoScope } from '@prisma/client'

export type PlazoWithScopes = Plazo & {
  scopes: (PlazoScope & {
    competition: { id: string; name: string; system: string }
  })[]
}

export type PlazoWithScopesAndMatches = PlazoWithScopes & {
  matches: { id: string; status: string }[]
}

export interface IPlazoRepository {
  findBySeasonHalfId(seasonHalfId: string): Promise<PlazoWithScopes[]>
  findBySeasonId(seasonId: string): Promise<PlazoWithScopes[]>
  findOneById(id: string): Promise<PlazoWithScopesAndMatches | null>
  save(data: {
    seasonHalfId: string
    title: string
    deadline: Date
    order: number
    scopes: Array<{
      competitionId: string
      matchdayFrom?: number | null
      matchdayTo?: number | null
      knockoutRounds?: string[]
    }>
  }): Promise<PlazoWithScopes>
  updateOneById(
    id: string,
    data: {
      title?: string
      deadline?: Date
      order?: number
      scopes?: Array<{
        competitionId: string
        matchdayFrom?: number | null
        matchdayTo?: number | null
        knockoutRounds?: string[]
      }>
    }
  ): Promise<PlazoWithScopes>
  deleteOneById(id: string): Promise<Plazo>
  assignMatchesToPlazo(plazoId: string, matchIds: string[]): Promise<number>
  clearMatchAssignments(plazoId: string): Promise<number>
}
