import { LeaguesRules, KempesCupRules } from 'utils/types'
import { Competition } from '@prisma/client'

export interface ICompetitionRepository {
  // generateFixture(): Promise<[] | null> // TODO: Return type (Prisma Fixture Model or null)
  save(config: LeaguesRules | KempesCupRules): Promise<void>
  updateOneById(id: string, config: Partial<LeaguesRules | KempesCupRules>): Promise<void>
  deleteOneById(id: string): Promise<void>
  findAll(): Promise<Competition[] | null>
  findOneById(id: string): Promise<Competition | null>
}
