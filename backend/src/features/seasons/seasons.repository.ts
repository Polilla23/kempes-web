import { Season, Prisma, PrismaClient, MatchStatus, SeasonTransition } from '@prisma/client'
import { ISeasonRepository } from '@/features/seasons/interface/ISeasonRepository'

export class SeasonRepository implements ISeasonRepository {
  private prisma: PrismaClient
  
  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findAll(): Promise<Season[]> {
    return await this.prisma.season.findMany({
      orderBy: { number: 'desc' }
    })
  }

  async findOneById(id: string): Promise<Season | null> {
    return await this.prisma.season.findUnique({ where: { id } })
  }

  async findOneByNumber(number: number): Promise<Season | null> {
    return await this.prisma.season.findUnique({ where: { number } })
  }

  async findActiveSeason(): Promise<Season | null> {
    return await this.prisma.season.findFirst({
      where: { isActive: true }
    })
  }

  async save(data: Prisma.SeasonCreateInput): Promise<Season> {
    return await this.prisma.season.create({ data })
  }

  async updateOneById(id: string, data: Prisma.SeasonUpdateInput): Promise<Season> {
    return await this.prisma.season.update({ where: { id }, data })
  }

  async deleteOneById(id: string): Promise<Season> {
    return await this.prisma.season.delete({ where: { id } })
  }

  async countPendingMatches(seasonId: string): Promise<number> {
    return await this.prisma.match.count({
      where: {
        competition: { seasonId },
        status: { in: [MatchStatus.PENDIENTE, MatchStatus.CANCELADO] }
      }
    })
  }

  async findTransitionsBySeason(seasonId: string) {
    return await this.prisma.seasonTransition.findMany({
      where: { seasonId },
      include: {
        club: true,
        fromCompetition: {
          include: { competitionType: true }
        },
        toCompetition: {
          include: { competitionType: true }
        }
      }
    })
  }

  async saveTransitions(transitions: Prisma.SeasonTransitionCreateManyInput[]) {
    return await this.prisma.seasonTransition.createMany({
      data: transitions
    })
  }
}
