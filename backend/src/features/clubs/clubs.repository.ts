import { IClubRepository, ClubTitle, ClubHistoryEntry, ClubFinanceEntry } from '@/features/clubs/interfaces/IClubRepository'
import { Prisma, PrismaClient, MovementType, CupPhase, CompetitionFormat } from '@prisma/client'

export class ClubRepository implements IClubRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findAll() {
    return await this.prisma.club.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
  }

  async findOneById(id: Prisma.ClubWhereUniqueInput['id']) {
    return await this.prisma.club.findUnique({ where: { id } })
  }

  async findOneByName(name: Prisma.ClubWhereUniqueInput['name']) {
    return await this.prisma.club.findUnique({ where: { name } })
  }

  async findOneByUserId(id: Prisma.ClubWhereUniqueInput['userId']) {
    return await this.prisma.club.findFirst({
      where: { userId: id },
    })
  }

  async save(data: Prisma.ClubCreateInput) {
    return await this.prisma.club.create({ data })
  }

  async saveMany(data: Prisma.ClubCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.club.createMany({
      data,
      skipDuplicates: true,
    })
  }

  async deleteOneById(id: Prisma.ClubWhereUniqueInput['id']) {
    return await this.prisma.club.delete({ where: { id } })
  }

  async updateOneById(id: Prisma.ClubWhereUniqueInput['id'], data: Prisma.ClubUpdateInput) {
    return await this.prisma.club.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
  }

  async findAvailableClubs() {
    return await this.prisma.club.findMany({
      where: {
        userId: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        logo: true,
      },
      orderBy: { name: 'asc' },
    })
  }

  async getActivePlayers(clubId: string) {
    return await this.prisma.player.findMany({
      where: {
        actualClubId: clubId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        overall: true,
      },
      orderBy: [{ lastName: 'asc' }, { name: 'asc' }],
    })
  }

  async findTitles(clubId: string): Promise<{ total: number; titles: ClubTitle[] }> {
    // Títulos de liga: SeasonTransition WHERE movementType = CHAMPION
    const leagueTitles = await this.prisma.seasonTransition.findMany({
      where: {
        clubId,
        movementType: MovementType.CHAMPION,
      },
      include: {
        season: { select: { number: true } },
        fromCompetition: {
          include: { competitionType: { select: { name: true, format: true } } },
        },
      },
      orderBy: { season: { number: 'desc' } },
    })

    // Títulos de copa: CoefKempes WHERE cupPhase = CHAMPION
    const cupTitles = await this.prisma.coefKempes.findMany({
      where: {
        clubId,
        cupPhase: CupPhase.CHAMPION,
      },
      include: {
        season: { select: { number: true } },
      },
      orderBy: { season: { number: 'desc' } },
    })

    const titles: ClubTitle[] = [
      ...leagueTitles.map((t) => ({
        seasonNumber: t.season.number,
        competitionName: t.fromCompetition.competitionType.name,
        type: 'LEAGUE' as const,
      })),
      ...cupTitles.map((t) => ({
        seasonNumber: t.season.number,
        competitionName: t.cupName,
        type: 'CUP' as const,
      })),
    ]

    titles.sort((a, b) => b.seasonNumber - a.seasonNumber)

    return { total: titles.length, titles }
  }

  async findSquad(clubId: string): Promise<{ squadValue: number; players: any[]; bestXI: any[] }> {
    const players = await this.prisma.player.findMany({
      where: { actualClubId: clubId, isActive: true },
      select: {
        id: true,
        name: true,
        lastName: true,
        birthdate: true,
        overall: true,
        salary: true,
        isKempesita: true,
        avatar: true,
        sofifaId: true,
      },
      orderBy: [{ overall: 'desc' }, { lastName: 'asc' }],
    })

    const squadValue = players.reduce((sum, p) => sum + p.salary, 0)
    const bestXI = players.slice(0, 11)

    return { squadValue, players, bestXI }
  }

  async findHistory(clubId: string): Promise<ClubHistoryEntry[]> {
    const history = await this.prisma.clubHistory.findMany({
      where: { clubId },
      include: {
        season: { select: { number: true } },
        competition: {
          include: { competitionType: { select: { name: true, format: true } } },
        },
      },
      orderBy: [{ season: { number: 'desc' } }],
    })

    return history.map((h) => ({
      seasonNumber: h.season.number,
      competitionName: h.competition.competitionType.name,
      competitionFormat: h.competition.competitionType.format,
      finalPosition: h.finalPosition,
      points: h.points,
      played: h.played,
      won: h.won,
      drawn: h.drawn,
      lost: h.lost,
      goalsFor: h.goalsFor,
      goalsAgainst: h.goalsAgainst,
      movement: h.movement,
    }))
  }

  async findFinances(clubId: string): Promise<ClubFinanceEntry[]> {
    const balances = await this.prisma.clubSeasonBalance.findMany({
      where: { clubId },
      include: {
        seasonHalf: {
          include: {
            season: { select: { number: true } },
          },
        },
      },
      orderBy: [
        { seasonHalf: { season: { number: 'desc' } } },
        { seasonHalf: { halfType: 'asc' } },
      ],
    })

    return balances.map((b) => ({
      seasonNumber: b.seasonHalf.season.number,
      halfType: b.seasonHalf.halfType,
      startingBalance: b.startingBalance,
      endingBalance: b.endingBalance,
      totalIncome: b.totalIncome,
      totalExpenses: b.totalExpenses,
      totalSalaries: b.totalSalaries,
    }))
  }
}
