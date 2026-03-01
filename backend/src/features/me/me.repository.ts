import { PrismaClient, MatchStatus, CompetitionFormat, CompetitionName, Prisma } from '@prisma/client'

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
   * Get recent finished matches for the user's club (current season only)
   */
  async getUserRecentMatches(clubId: string, limit: number = 10): Promise<MatchWithRelations[]> {
    const activeSeason = await this.prisma.season.findFirst({
      where: { isActive: true },
    })

    if (!activeSeason) return []

    return await this.prisma.match.findMany({
      where: {
        status: MatchStatus.FINALIZADO,
        OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
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
      orderBy: [
        { resultRecordedAt: 'desc' },
        { matchdayOrder: 'desc' },
      ],
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
   * Get global recent finished matches for carousel (current season only)
   */
  async getRecentMatches(limit: number = 20): Promise<MatchWithRelations[]> {
    const activeSeason = await this.prisma.season.findFirst({
      where: { isActive: true },
    })

    if (!activeSeason) return []

    const matches = await this.prisma.match.findMany({
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
      orderBy: [
        { resultRecordedAt: 'desc' },
        { matchdayOrder: 'desc' },
      ],
    })

    // Filter out BYE matches and matches without both clubs assigned
    return matches
      .filter(m => m.homeClubId && m.awayClubId && m.homePlaceholder !== 'BYE' && m.awayPlaceholder !== 'BYE')
      .slice(0, limit)
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
        champions: [],
      }
    }

    // Find the previous season for champions data
    const previousSeason = activeSeason.number > 1
      ? await this.prisma.season.findFirst({
          where: { number: activeSeason.number - 1 },
        })
      : null

    const [played, pending, cancelled, championsData] = await Promise.all([
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
      previousSeason
        ? this.prisma.clubHistory.findMany({
            where: {
              seasonId: previousSeason.id,
              finalPosition: 1,
              competition: {
                competitionType: {
                  name: {
                    in: [CompetitionName.LEAGUE_A, CompetitionName.GOLD_CUP, CompetitionName.CINDOR_CUP],
                  },
                },
              },
            },
            include: {
              club: { select: { id: true, name: true, logo: true } },
              competition: {
                include: { competitionType: { select: { name: true } } },
              },
            },
          })
        : Promise.resolve([]),
    ])

    // Map champions in a fixed order: LEAGUE_A, GOLD_CUP, CINDOR_CUP
    const championOrder = [CompetitionName.LEAGUE_A, CompetitionName.GOLD_CUP, CompetitionName.CINDOR_CUP]
    const champions = championOrder
      .map((compName) => {
        const ch = championsData.find((c) => c.competition.competitionType.name === compName)
        if (!ch) return null
        return {
          competitionType: ch.competition.competitionType.name,
          clubName: ch.club.name,
          clubLogo: ch.club.logo,
        }
      })
      .filter(Boolean)

    return {
      seasonNumber: activeSeason.number,
      seasonId: activeSeason.id,
      playedMatches: played,
      pendingMatches: pending,
      cancelledMatches: cancelled,
      totalTransfers: 0, // Placeholder
      champions,
    }
  }
}
