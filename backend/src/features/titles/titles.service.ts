import { CompetitionName, CompetitionCategory } from '@prisma/client'
import { TitleRepository } from './titles.repository'
import { TitlePointConfigNotFoundError, InvalidCompetitionNameError } from './titles.errors'

export class TitleService {
  private titleRepository: TitleRepository

  constructor({ titleRepository }: { titleRepository: TitleRepository }) {
    this.titleRepository = titleRepository
  }

  async getGlobalRanking() {
    return this.titleRepository.getGlobalRanking()
  }

  async getSeasonChampions(category?: CompetitionCategory) {
    return this.titleRepository.getSeasonChampionsGrouped(category)
  }

  async getSeasonChampionsByNumber(seasonNumber: number) {
    return this.titleRepository.getSeasonChampionsGrouped()
      .then((seasons) => seasons.find((s: any) => s.seasonNumber === seasonNumber) || null)
  }

  async getCompetitionChampions(competitionName: string) {
    if (!Object.values(CompetitionName).includes(competitionName as CompetitionName)) {
      throw new InvalidCompetitionNameError(competitionName)
    }

    return this.titleRepository.getCompetitionChampions(competitionName as CompetitionName)
  }

  async getPointConfigs() {
    return this.titleRepository.findAllPointConfigs()
  }

  async updatePointConfig(id: string, points: number) {
    const existing = await this.titleRepository.findPointConfigById(id)
    if (!existing) {
      throw new TitlePointConfigNotFoundError(id)
    }

    if (points < 0) {
      throw new Error('Points must be a non-negative number')
    }

    return this.titleRepository.upsertPointConfig(
      existing.competitionName,
      existing.category,
      points
    )
  }

  // Used by player/club profile refactoring
  async findByClub(clubId: string) {
    return this.titleRepository.findByClub(clubId)
  }

  async findByClubSeasonPairs(pairs: { clubId: string; seasonId: string }[]) {
    return this.titleRepository.findByClubSeasonPairs(pairs)
  }
}
