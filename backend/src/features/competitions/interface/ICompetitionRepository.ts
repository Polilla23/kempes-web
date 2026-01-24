import { CompetitionRules } from '@/types'
import { Competition, CompetitionType, Prisma } from '@prisma/client'

export type CompetitionWithType = Competition & { competitionType: CompetitionType }

export interface ICompetitionRepository {
  save(config: CompetitionRules): Promise<Competition[]>
  updateOneById(id: string, config: CompetitionRules): Promise<Competition>
  deleteOneById(id: string): Promise<void>
  findAll(): Promise<CompetitionWithType[] | null>
  findOneById(id: string): Promise<Competition | null>
  findOneByIdWithType(id: string): Promise<CompetitionWithType | null>
  findOneBySeasonId(seasonId: string): Promise<CompetitionWithType[] | null>
}
