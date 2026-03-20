import { IPlayerRespository, PlayerCareerByClub, PlayerCareerTotals, PlayerSeasonStatsEntry, PlayerTitle } from '@/features/players/interface/IPlayerRepository'
import { Prisma, PrismaClient } from '@prisma/client'

export class PlayerRepository implements IPlayerRespository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findAll() {
    return await this.prisma.player.findMany({
      include: {
        ownerClub: {
          select: {
            id: true,
            name: true,
          },
        },
        actualClub: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async findOneById(id: Prisma.PlayerWhereUniqueInput['id']) {
    return await this.prisma.player.findUnique({
      where: { id },
    })
  }

  async updateOneById(id: Prisma.PlayerWhereUniqueInput['id'], data: Prisma.PlayerUpdateInput) {
    return await this.prisma.player.update({
      where: { id: id },
      data,
      include: {
        ownerClub: { select: { id: true, name: true } },
        actualClub: { select: { id: true, name: true } },
      }
    })
  }

  async deleteOneById(id: Prisma.PlayerWhereUniqueInput['id']) {
    return await this.prisma.player.delete({
      where: { id: id },
    })
  }

  async save(data: Prisma.PlayerCreateInput) {
    return await this.prisma.player.create({ data })
  }

  async saveMany(data: Prisma.PlayerCreateInput[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.player.createMany({
      data,
      skipDuplicates: true,
    })
  }

  async findCareer(playerId: string): Promise<{ careerByClub: PlayerCareerByClub[]; careerTotals: PlayerCareerTotals }> {
    const stats = await this.prisma.playerSeasonStats.findMany({
      where: { playerId },
      include: {
        club: { select: { id: true, name: true, logo: true } },
        season: { select: { number: true } },
      },
      orderBy: { season: { number: 'asc' } },
    })

    // Agrupar por club
    const clubMap = new Map<string, {
      club: { id: string; name: string; logo: string | null }
      seasons: Set<number>
      appearances: number
      goals: number
      assists: number
      yellowCards: number
      redCards: number
      mvps: number
    }>()

    const totals: PlayerCareerTotals = {
      appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvps: 0,
    }

    for (const stat of stats) {
      const key = stat.clubId
      if (!clubMap.has(key)) {
        clubMap.set(key, {
          club: stat.club,
          seasons: new Set(),
          appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, mvps: 0,
        })
      }
      const entry = clubMap.get(key)!
      entry.seasons.add(stat.season.number)
      entry.appearances += stat.appearances
      entry.goals += stat.goals
      entry.assists += stat.assists
      entry.yellowCards += stat.yellowCards
      entry.redCards += stat.redCards
      entry.mvps += stat.mvps

      totals.appearances += stat.appearances
      totals.goals += stat.goals
      totals.assists += stat.assists
      totals.yellowCards += stat.yellowCards
      totals.redCards += stat.redCards
      totals.mvps += stat.mvps
    }

    const careerByClub: PlayerCareerByClub[] = Array.from(clubMap.values()).map((entry) => ({
      club: entry.club,
      fromSeason: Math.min(...entry.seasons),
      toSeason: Math.max(...entry.seasons),
      totalAppearances: entry.appearances,
      totalGoals: entry.goals,
      totalAssists: entry.assists,
      totalYellowCards: entry.yellowCards,
      totalRedCards: entry.redCards,
      totalMvps: entry.mvps,
    }))

    // Ordenar por primera temporada
    careerByClub.sort((a, b) => a.fromSeason - b.fromSeason)

    return { careerByClub, careerTotals: totals }
  }

  async findSeasonStats(playerId: string): Promise<PlayerSeasonStatsEntry[]> {
    const stats = await this.prisma.playerSeasonStats.findMany({
      where: { playerId },
      include: {
        season: { select: { number: true } },
        competition: {
          include: { competitionType: { select: { name: true, format: true } } },
        },
        club: { select: { id: true, name: true, logo: true } },
      },
      orderBy: [{ season: { number: 'desc' } }],
    })

    return stats.map((s) => ({
      seasonNumber: s.season.number,
      competitionName: s.competition.competitionType.name,
      competitionFormat: s.competition.competitionType.format,
      club: s.club,
      appearances: s.appearances,
      goals: s.goals,
      assists: s.assists,
      yellowCards: s.yellowCards,
      redCards: s.redCards,
      mvps: s.mvps,
    }))
  }

  async findTitles(playerId: string): Promise<PlayerTitle[]> {
    // Obtener todos los clubIds + seasonIds donde jugó este player
    const playerStats = await this.prisma.playerSeasonStats.findMany({
      where: { playerId },
      select: { clubId: true, seasonId: true },
    })

    if (playerStats.length === 0) return []

    // Crear pares únicos de (clubId, seasonId)
    const uniquePairs = [...new Set(playerStats.map((ps) => `${ps.clubId}:${ps.seasonId}`))]
      .map((pair) => {
        const [clubId, seasonId] = pair.split(':')
        return { clubId, seasonId }
      })

    // Una sola query a TitleHistory
    const titleHistory = await this.prisma.titleHistory.findMany({
      where: {
        OR: uniquePairs,
      },
      include: {
        season: { select: { number: true } },
        club: { select: { id: true, name: true, logo: true } },
      },
      orderBy: { season: { number: 'desc' } },
    })

    return titleHistory.map((t) => ({
      seasonNumber: t.season.number,
      competitionName: t.competitionName,
      type: t.type === 'LEAGUE' ? 'LEAGUE' : 'CUP',
      club: t.club,
    }))
  }

  async findTransferHistory(playerId: string): Promise<any[]> {
    const transfers = await this.prisma.transfer.findMany({
      where: { playerId },
      include: {
        fromClub: { select: { id: true, name: true, logo: true } },
        toClub: { select: { id: true, name: true, logo: true } },
        seasonHalf: {
          include: { season: { select: { number: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return transfers.map((t) => ({
      id: t.id,
      type: t.type,
      status: t.status,
      fromClub: t.fromClub,
      toClub: t.toClub,
      totalAmount: t.totalAmount,
      seasonNumber: t.seasonHalf.season.number,
      halfType: t.seasonHalf.halfType,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
    }))
  }
}
