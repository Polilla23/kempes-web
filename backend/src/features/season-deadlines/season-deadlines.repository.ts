import { ISeasonDeadlineRepository } from '@/features/season-deadlines/interfaces/ISeasonDeadlineRepository'
import { Prisma, PrismaClient } from '@prisma/client'

export class SeasonDeadlineRepository implements ISeasonDeadlineRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findBySeasonId(seasonId: string) {
    return await this.prisma.seasonDeadline.findMany({
      where: { seasonId },
      orderBy: { date: 'asc' },
    })
  }

  async findOneById(id: Prisma.SeasonDeadlineWhereUniqueInput['id']) {
    return await this.prisma.seasonDeadline.findUnique({
      where: { id },
    })
  }

  async save(data: Prisma.SeasonDeadlineUncheckedCreateInput) {
    return await this.prisma.seasonDeadline.create({ data })
  }

  async saveMany(data: Prisma.SeasonDeadlineCreateManyInput[]) {
    return await this.prisma.seasonDeadline.createMany({
      data,
      skipDuplicates: true,
    })
  }

  async updateOneById(id: Prisma.SeasonDeadlineWhereUniqueInput['id'], data: Prisma.SeasonDeadlineUpdateInput) {
    return await this.prisma.seasonDeadline.update({
      where: { id },
      data,
    })
  }

  async deleteOneById(id: Prisma.SeasonDeadlineWhereUniqueInput['id']) {
    return await this.prisma.seasonDeadline.delete({ where: { id } })
  }
}
