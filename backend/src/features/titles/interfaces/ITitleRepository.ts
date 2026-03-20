import { TitleHistory, TitlePointConfig, Prisma, CompetitionName, CompetitionCategory } from '@prisma/client'

export interface ITitleRepository {
  findAll(filters?: {
    clubId?: string
    seasonId?: string
    competitionName?: CompetitionName
    category?: CompetitionCategory
  }): Promise<TitleHistory[]>

  findByClub(clubId: string): Promise<TitleHistory[]>

  findBySeason(seasonId: string): Promise<TitleHistory[]>

  findByCompetition(competitionName: CompetitionName): Promise<TitleHistory[]>

  findByClubSeasonPairs(pairs: { clubId: string; seasonId: string }[]): Promise<TitleHistory[]>

  saveMany(data: Prisma.TitleHistoryCreateManyInput[]): Promise<number>

  // Point config
  findAllPointConfigs(): Promise<TitlePointConfig[]>

  findPointConfigById(id: string): Promise<TitlePointConfig | null>

  findPointConfig(competitionName: CompetitionName, category: CompetitionCategory): Promise<TitlePointConfig | null>

  upsertPointConfig(competitionName: CompetitionName, category: CompetitionCategory, points: number): Promise<TitlePointConfig>
}
