import { PrismaClient, TitleHistory, TitlePointConfig, Prisma, CompetitionName, CompetitionCategory } from '@prisma/client'
import { ITitleRepository } from './interfaces/ITitleRepository'

export class TitleRepository implements ITitleRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findAll(filters?: {
    clubId?: string
    seasonId?: string
    competitionName?: CompetitionName
    category?: CompetitionCategory
  }): Promise<TitleHistory[]> {
    const where: Prisma.TitleHistoryWhereInput = {}
    if (filters?.clubId) where.clubId = filters.clubId
    if (filters?.seasonId) where.seasonId = filters.seasonId
    if (filters?.competitionName) where.competitionName = filters.competitionName
    if (filters?.category) where.category = filters.category

    return this.prisma.titleHistory.findMany({
      where,
      include: {
        club: { select: { id: true, name: true, logo: true } },
        season: { select: { id: true, number: true } },
      },
      orderBy: { season: { number: 'desc' } },
    })
  }

  async findByClub(clubId: string): Promise<TitleHistory[]> {
    return this.prisma.titleHistory.findMany({
      where: { clubId },
      include: {
        club: { select: { id: true, name: true, logo: true } },
        season: { select: { id: true, number: true } },
      },
      orderBy: { season: { number: 'desc' } },
    })
  }

  async findBySeason(seasonId: string): Promise<TitleHistory[]> {
    return this.prisma.titleHistory.findMany({
      where: { seasonId },
      include: {
        club: { select: { id: true, name: true, logo: true } },
        season: { select: { id: true, number: true } },
      },
      orderBy: { competitionName: 'asc' },
    })
  }

  async findByCompetition(competitionName: CompetitionName): Promise<TitleHistory[]> {
    return this.prisma.titleHistory.findMany({
      where: { competitionName },
      include: {
        club: { select: { id: true, name: true, logo: true } },
        season: { select: { id: true, number: true } },
      },
      orderBy: { season: { number: 'asc' } },
    })
  }

  async findByClubSeasonPairs(pairs: { clubId: string; seasonId: string }[]): Promise<TitleHistory[]> {
    if (pairs.length === 0) return []

    return this.prisma.titleHistory.findMany({
      where: {
        OR: pairs.map((pair) => ({
          clubId: pair.clubId,
          seasonId: pair.seasonId,
        })),
      },
      include: {
        club: { select: { id: true, name: true, logo: true } },
        season: { select: { id: true, number: true } },
      },
      orderBy: { season: { number: 'desc' } },
    })
  }

  async saveMany(data: Prisma.TitleHistoryCreateManyInput[]): Promise<number> {
    const result = await this.prisma.titleHistory.createMany({
      data,
      skipDuplicates: true,
    })
    return result.count
  }

  // Title Point Config methods

  async findAllPointConfigs(): Promise<TitlePointConfig[]> {
    return this.prisma.titlePointConfig.findMany({
      orderBy: { points: 'desc' },
    })
  }

  async findPointConfigById(id: string): Promise<TitlePointConfig | null> {
    return this.prisma.titlePointConfig.findUnique({
      where: { id },
    })
  }

  async findPointConfig(competitionName: CompetitionName, category: CompetitionCategory): Promise<TitlePointConfig | null> {
    return this.prisma.titlePointConfig.findUnique({
      where: { competitionName_category: { competitionName, category } },
    })
  }

  async upsertPointConfig(competitionName: CompetitionName, category: CompetitionCategory, points: number): Promise<TitlePointConfig> {
    return this.prisma.titlePointConfig.upsert({
      where: { competitionName_category: { competitionName, category } },
      update: { points },
      create: { competitionName, category, points },
    })
  }

  // Aggregated queries for ranking and season champions

  async getGlobalRanking(): Promise<any[]> {
    // Get all titles with club info
    const titles = await this.prisma.titleHistory.findMany({
      include: {
        club: { select: { id: true, name: true, logo: true } },
      },
    })

    // Get point configs — keyed by "competitionName:category"
    const configs = await this.prisma.titlePointConfig.findMany()
    const pointMap = new Map(configs.map((c) => [`${c.competitionName}:${c.category}`, c.points]))

    // Aggregate by club
    const clubMap = new Map<string, {
      club: { id: string; name: string; logo: string | null }
      totalPoints: number
      totalTitles: number
      breakdown: Record<string, number>
    }>()

    for (const title of titles) {
      const compositeKey = `${title.competitionName}:${title.category}`
      // Skip titles that don't have a point config (e.g. LEAGUE_B, KEMPES_CUP)
      if (!pointMap.has(compositeKey)) continue

      const key = title.clubId
      if (!clubMap.has(key)) {
        clubMap.set(key, {
          club: title.club,
          totalPoints: 0,
          totalTitles: 0,
          breakdown: {},
        })
      }
      const entry = clubMap.get(key)!
      const pts = pointMap.get(compositeKey) || 0
      entry.totalPoints += pts
      entry.totalTitles += 1
      entry.breakdown[compositeKey] = (entry.breakdown[compositeKey] || 0) + 1
    }

    // Sort by total points desc, then total titles desc
    return Array.from(clubMap.values()).sort((a, b) =>
      b.totalPoints - a.totalPoints || b.totalTitles - a.totalTitles
    )
  }

  async getSeasonChampionsGrouped(category?: CompetitionCategory): Promise<any[]> {
    const where: Prisma.TitleHistoryWhereInput = {}
    if (category) where.category = category

    const titles = await this.prisma.titleHistory.findMany({
      where,
      include: {
        club: { select: { id: true, name: true, logo: true } },
        season: { select: { id: true, number: true } },
      },
      orderBy: [{ season: { number: 'asc' } }, { competitionName: 'asc' }],
    })

    // Group by season, and for each title compute cumulative count
    const cumulativeCount = new Map<string, number>() // "clubId:competitionName" → count

    const seasonMap = new Map<number, {
      seasonNumber: number
      seasonId: string
      champions: {
        competitionName: string
        type: string
        category: string
        club: { id: string; name: string; logo: string | null }
        titleCount: number
      }[]
    }>()

    for (const title of titles) {
      const seasonNum = (title as any).season.number
      const seasonId = title.seasonId
      const cumulativeKey = `${title.clubId}:${title.competitionName}`

      cumulativeCount.set(cumulativeKey, (cumulativeCount.get(cumulativeKey) || 0) + 1)

      if (!seasonMap.has(seasonNum)) {
        seasonMap.set(seasonNum, { seasonNumber: seasonNum, seasonId, champions: [] })
      }

      seasonMap.get(seasonNum)!.champions.push({
        competitionName: title.competitionName,
        type: title.type,
        category: title.category,
        club: (title as any).club,
        titleCount: cumulativeCount.get(cumulativeKey)!,
      })
    }

    // Return sorted by season desc (newest first)
    return Array.from(seasonMap.values()).sort((a, b) => b.seasonNumber - a.seasonNumber)
  }

  async getCompetitionChampions(competitionName: CompetitionName): Promise<any> {
    const titles = await this.prisma.titleHistory.findMany({
      where: { competitionName },
      include: {
        club: { select: { id: true, name: true, logo: true } },
        season: { select: { id: true, number: true } },
      },
      orderBy: { season: { number: 'asc' } },
    })

    // Compute title number per club (incremental)
    const clubCount = new Map<string, number>()
    const champions = titles.map((title) => {
      const count = (clubCount.get(title.clubId) || 0) + 1
      clubCount.set(title.clubId, count)
      return {
        seasonNumber: (title as any).season.number,
        club: (title as any).club,
        titleNumber: count,
      }
    })

    // Find most successful
    let mostSuccessful: { club: any; count: number } | null = null
    for (const [clubId, count] of clubCount.entries()) {
      const clubTitle = titles.find((t) => t.clubId === clubId)
      if (!mostSuccessful || count > mostSuccessful.count) {
        mostSuccessful = { club: (clubTitle as any)?.club, count }
      }
    }

    return {
      competitionName,
      champions,
      mostSuccessful,
    }
  }
}
