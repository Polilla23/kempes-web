import { ISeasonHalfRepository } from '@/features/season-halves/interfaces/ISeasonHalfRepository'
import { Prisma, PrismaClient, SeasonHalfType } from '@prisma/client'

export class SeasonHalfRepository implements ISeasonHalfRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findAll() {
    return await this.prisma.seasonHalf.findMany({
      include: {
        season: true,
      },
      orderBy: [
        { season: { number: 'desc' } },
        { halfType: 'asc' },
      ],
    })
  }

  async findOneById(id: Prisma.SeasonHalfWhereUniqueInput['id']) {
    return await this.prisma.seasonHalf.findUnique({
      where: { id },
      include: {
        season: true,
      },
    })
  }

  async findBySeasonId(seasonId: string) {
    return await this.prisma.seasonHalf.findMany({
      where: { seasonId },
      include: {
        season: true,
      },
      orderBy: { halfType: 'asc' },
    })
  }

  async findActive() {
    return await this.prisma.seasonHalf.findFirst({
      where: { isActive: true },
      include: {
        season: true,
      },
    })
  }

  async findBySeasonAndHalfType(seasonId: string, halfType: SeasonHalfType) {
    return await this.prisma.seasonHalf.findUnique({
      where: {
        seasonId_halfType: {
          seasonId,
          halfType,
        },
      },
      include: {
        season: true,
      },
    })
  }

  async findPrevious(seasonHalfId: string) {
    // Obtener la media temporada actual
    const current = await this.prisma.seasonHalf.findUnique({
      where: { id: seasonHalfId },
      include: { season: true },
    })

    if (!current) return null

    // Si es SECOND_HALF, la anterior es FIRST_HALF de la misma temporada
    if (current.halfType === 'SECOND_HALF') {
      return await this.prisma.seasonHalf.findUnique({
        where: {
          seasonId_halfType: {
            seasonId: current.seasonId,
            halfType: 'FIRST_HALF',
          },
        },
        include: { season: true },
      })
    }

    // Si es FIRST_HALF, la anterior es SECOND_HALF de la temporada anterior
    const previousSeason = await this.prisma.season.findFirst({
      where: { number: current.season.number - 1 },
    })

    if (!previousSeason) return null

    return await this.prisma.seasonHalf.findUnique({
      where: {
        seasonId_halfType: {
          seasonId: previousSeason.id,
          halfType: 'SECOND_HALF',
        },
      },
      include: { season: true },
    })
  }

  async save(data: Prisma.SeasonHalfCreateInput) {
    return await this.prisma.seasonHalf.create({ data })
  }

  async saveMany(data: Prisma.SeasonHalfCreateManyInput[]) {
    return await this.prisma.seasonHalf.createMany({
      data,
      skipDuplicates: true,
    })
  }

  async updateOneById(id: Prisma.SeasonHalfWhereUniqueInput['id'], data: Prisma.SeasonHalfUpdateInput) {
    return await this.prisma.seasonHalf.update({
      where: { id },
      data,
    })
  }

  async deleteOneById(id: Prisma.SeasonHalfWhereUniqueInput['id']) {
    return await this.prisma.seasonHalf.delete({ where: { id } })
  }

  // Desactivar todas las medias temporadas antes de activar una nueva
  async deactivateAll() {
    return await this.prisma.seasonHalf.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })
  }
}
