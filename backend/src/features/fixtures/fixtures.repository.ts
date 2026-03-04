import { PrismaClient, Match, CompetitionStage, MatchStatus, Prisma } from '@prisma/client'
import { IFixtureRepository } from '@/features/fixtures/interface/IFixtureRepository'

export class FixtureRepository implements IFixtureRepository {
  private prisma: PrismaClient
  
  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async createMatch(data: Prisma.MatchCreateInput): Promise<Match> {
    return this.prisma.match.create({
      data,
      include: {
        homeClub: true,
        awayClub: true,
        competition: true,
        homeSourceMatch: true,
        awaySourceMatch: true,
      },
    })
  }

  async createManyMatches(data: Prisma.MatchCreateInput[]): Promise<Match[]> {
    return await this.prisma.$transaction(
      data.map((matchData) => this.prisma.match.create({ data: matchData }))
    )
  }

  async findAll(): Promise<Match[]> {
    return this.prisma.match.findMany({
      include: {
        homeClub: true,
        awayClub: true,
        competition: true,
        homeSourceMatch: true,
        awaySourceMatch: true,
      },
    })
  }

  async findById(id: string): Promise<Match | null> {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        homeClub: true,
        awayClub: true,
        competition: true,
        homeSourceMatch: {
          include: {
            homeClub: true,
            awayClub: true,
          },
        },
        awaySourceMatch: {
          include: {
            homeClub: true,
            awayClub: true,
          },
        },
        homeNextMatches: true,
        dependentMatches: true,
      },
    })
  }

  async findByIdForSubmit(id: string): Promise<Match | null> {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        homeClub: true,
        awayClub: true,
        competition: true,
        homeNextMatches: true,
        dependentMatches: true,
      },
    })
  }

  async findMatchesDependingOn(id: string): Promise<Match[]> {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        homeNextMatches: {
          include: {
            homeClub: true,
            awayClub: true,
            competition: true,
          },
        },
        dependentMatches: {
          include: {
            homeClub: true,
            awayClub: true,
            competition: true,
          },
        },
      },
    })

    if (!match) return []

    const uniqueDependents = [...match.homeNextMatches, ...match.dependentMatches]

    return uniqueDependents
  }

  async getMatchesByCompetition(id: string): Promise<Match[]> {
    return await this.prisma.match.findMany({
      where: { competitionId: id },
      include: {
        homeClub: true,
        awayClub: true,
        competition: true,
      },
      orderBy: [{ matchdayOrder: 'asc' }, { id: 'asc' }],
    })
  }

  async getMatchesWithFilters(seasonId?: string, competitionId?: string): Promise<Match[]> {
    const where: any = {}

    if (competitionId) {
      where.competitionId = competitionId
    } else if (seasonId) {
      where.competition = {
        seasonId: seasonId
      }
    }

    return await this.prisma.match.findMany({
      where,
      include: {
        homeClub: true,
        awayClub: true,
        competition: {
          include: {
            competitionType: true,
            season: true
          }
        },
        events: {
          include: {
            player: true,
            type: true,
          }
        },
      },
      orderBy: [
        { competition: { competitionType: { hierarchy: 'asc' } } },
        { matchdayOrder: 'asc' },
        { id: 'asc' }
      ],
    })
  }

  async getKnockoutBracket(id: string): Promise<Match[]> {
    return await this.prisma.match.findMany({
      where: {
        competitionId: id,
        stage: CompetitionStage.KNOCKOUT,
      },
      include: {
        homeClub: true,
        awayClub: true,
        homeSourceMatch: {
          include: {
            homeClub: true,
            awayClub: true,
          },
        },
        awaySourceMatch: {
          include: {
            homeClub: true,
            awayClub: true,
          },
        },
      },
      orderBy: [{ matchdayOrder: 'asc' }],
    })
  }

  async getGroupStageMatches(id: string): Promise<Match[]> {
    return await this.prisma.match.findMany({
      where: {
        competitionId: id,
        stage: CompetitionStage.ROUND_ROBIN,
      },
      include: {
        homeClub: true,
        awayClub: true,
        competition: true,
      },
      orderBy: [{ matchdayOrder: 'asc' }, { id: 'asc' }],
    })
  }

  async findByIdWithRawEvents(id: string) {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        homeClub: true,
        awayClub: true,
        competition: {
          include: {
            competitionType: true,
            season: true,
          },
        },
        events: {
          include: {
            player: true,
            type: true,
          },
        },
        homeNextMatches: true,
        dependentMatches: true,
      },
    })
  }

  async updateMatch(id: string, data: Prisma.MatchUpdateInput): Promise<Match> {
    return this.prisma.match.update({
      where: { id },
      data,
      include: {
        homeClub: true,
        awayClub: true,
        competition: true,
      },
    })
  }

  // ===================== COVID METHODS =====================

  async getActivePlayers(clubId: string) {
    return await this.prisma.player.findMany({
      where: {
        actualClubId: clubId,
        isActive: true
      }
    })
  }

  async createCovidRecords(records: { matchId: string; playerId: string; clubId: string }[]) {
    return await this.prisma.matchCovid.createMany({
      data: records,
      skipDuplicates: true
    })
  }

  async getMatchCovids(matchId: string) {
    return await this.prisma.matchCovid.findMany({
      where: { matchId },
      include: {
        player: true,
        club: true
      }
    })
  }

  // ===================== SUBMIT RESULT METHODS =====================

  async findPendingMatchesByClubId(clubId: string) {
    return await this.prisma.match.findMany({
      where: {
        status: MatchStatus.PENDIENTE,
        homeClubId: { not: null },
        awayClubId: { not: null },
        OR: [
          { homeClubId: clubId },
          { awayClubId: clubId },
        ],
      },
      include: {
        homeClub: true,
        awayClub: true,
        competition: {
          include: {
            competitionType: true,
          },
        },
      },
      orderBy: [
        { competition: { competitionType: { hierarchy: 'asc' } } },
        { matchdayOrder: 'asc' },
      ],
    })
  }

  async findClubByUserId(userId: string) {
    return await this.prisma.club.findFirst({
      where: { userId },
    })
  }
}
