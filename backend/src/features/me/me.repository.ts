import { PrismaClient, MatchStatus, CompetitionFormat, Prisma } from '@prisma/client'

// Define the return types for matches with includes
type MatchWithRelations = Prisma.MatchGetPayload<{
  include: {
    homeClub: { select: { id: true; name: true; logo: true } }
    awayClub: { select: { id: true; name: true; logo: true } }
    competition: { include: { competitionType: true } }
  }
}>

export class MyAccountRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  /**
   * Get user with their club information
   */
  async getUserWithClub(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        club: {
          include: {
            playerNow: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                lastName: true,
                overall: true,
              },
            },
            _count: {
              select: {
                playerOwner: true,
                playerNow: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Get the user's current league (LEAGUE format competition in active season)
   */
  async getUserLeague(clubId: string) {
    const activeSeason = await this.prisma.season.findFirst({
      where: { isActive: true },
    })

    if (!activeSeason) return null

    const competition = await this.prisma.competition.findFirst({
      where: {
        seasonId: activeSeason.id,
        isActive: true,
        competitionType: {
          format: CompetitionFormat.LEAGUE,
        },
        teams: {
          some: { id: clubId },
        },
      },
      include: {
        competitionType: true,
        season: true,
        teams: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    })

    return competition
  }

  /**
   * Get recent finished matches for the user's club
   */
  async getUserRecentMatches(clubId: string, limit: number = 10): Promise<MatchWithRelations[]> {
    return await this.prisma.match.findMany({
      where: {
        status: MatchStatus.FINALIZADO,
        OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
      },
      include: {
        homeClub: {
          select: { id: true, name: true, logo: true },
        },
        awayClub: {
          select: { id: true, name: true, logo: true },
        },
        competition: {
          include: {
            competitionType: true,
          },
        },
      },
      orderBy: { matchdayOrder: 'desc' },
      take: limit,
    })
  }

  /**
   * Get upcoming pending matches for the user's club
   */
  async getUserUpcomingMatches(clubId: string, limit: number = 5): Promise<MatchWithRelations[]> {
    return await this.prisma.match.findMany({
      where: {
        status: MatchStatus.PENDIENTE,
        OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
      },
      include: {
        homeClub: {
          select: { id: true, name: true, logo: true },
        },
        awayClub: {
          select: { id: true, name: true, logo: true },
        },
        competition: {
          include: {
            competitionType: true,
          },
        },
      },
      orderBy: [{ matchdayOrder: 'asc' }],
      take: limit,
    })
  }

  /**
   * Get global recent finished matches (for carousel)
   */
  async getRecentMatches(limit: number = 20): Promise<MatchWithRelations[]> {
    const activeSeason = await this.prisma.season.findFirst({
      where: { isActive: true },
    })

    if (!activeSeason) return []

    return await this.prisma.match.findMany({
      where: {
        status: MatchStatus.FINALIZADO,
        competition: {
          seasonId: activeSeason.id,
        },
      },
      include: {
        homeClub: {
          select: { id: true, name: true, logo: true },
        },
        awayClub: {
          select: { id: true, name: true, logo: true },
        },
        competition: {
          include: {
            competitionType: true,
          },
        },
      },
      orderBy: { matchdayOrder: 'desc' },
      take: limit,
    })
  }

  /**
   * Get season stats (played/pending matches, transfers placeholder)
   */
  async getSeasonStats() {
    const activeSeason = await this.prisma.season.findFirst({
      where: { isActive: true },
    })

    if (!activeSeason) {
      return {
        seasonNumber: 0,
        playedMatches: 0,
        pendingMatches: 0,
        cancelledMatches: 0,
        totalTransfers: 0, // Placeholder - transfers not implemented yet
      }
    }

    const [played, pending, cancelled] = await Promise.all([
      this.prisma.match.count({
        where: {
          competition: { seasonId: activeSeason.id },
          status: MatchStatus.FINALIZADO,
        },
      }),
      this.prisma.match.count({
        where: {
          competition: { seasonId: activeSeason.id },
          status: MatchStatus.PENDIENTE,
        },
      }),
      this.prisma.match.count({
        where: {
          competition: { seasonId: activeSeason.id },
          status: MatchStatus.CANCELADO,
        },
      }),
    ])

    return {
      seasonNumber: activeSeason.number,
      seasonId: activeSeason.id,
      playedMatches: played,
      pendingMatches: pending,
      cancelledMatches: cancelled,
      totalTransfers: 0, // Placeholder
    }
  }
}
