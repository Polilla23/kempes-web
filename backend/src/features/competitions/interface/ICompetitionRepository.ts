import { LeaguesRules, KempesCupRules } from '@/types'
import { Competition } from '@prisma/client'

export interface ICompetitionRepository {
  // generateFixture(): Promise<[] | null> // TODO: Return type (Prisma Fixture Model or null)
  save(config: LeaguesRules | KempesCupRules): Promise<Competition[]>
  updateOneById(id: string, config: Partial<LeaguesRules | KempesCupRules>): Promise<Competition>
  deleteOneById(id: string): Promise<void>
  findAll(): Promise<Competition[] | null>
  findOneById(id: string): Promise<Competition | null>
  findOneBySeasonId(seasonId: string): Promise<Competition[] | null>
}
