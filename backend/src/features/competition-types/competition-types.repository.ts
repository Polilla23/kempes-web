import { CompetitionType, Prisma, PrismaClient } from '@prisma/client'
import { ICompetitionTypeRepository } from '@/features/competition-types/interface/ICompetitionTypeRepository'

export class CompetitionTypeRepository implements ICompetitionTypeRepository {
  private prisma: PrismaClient
  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }
  async save(data: Prisma.CompetitionTypeCreateInput): Promise<void> {
    await this.prisma.competitionType.create({ data })
  }
  async findAll(): Promise<CompetitionType[]> {
    return await this.prisma.competitionType.findMany()
  }

  async findOneByName(name: Prisma.CompetitionTypeWhereUniqueInput['name']): Promise<CompetitionType | null> {
    return await this.prisma.competitionType.findUnique({ where: { name } })
  }
  async findOneById(id: Prisma.CompetitionTypeWhereUniqueInput['id']): Promise<CompetitionType | null> {
    return await this.prisma.competitionType.findUnique({ where: { id } })
  }
  async updateOneById(
    id: Prisma.CompetitionTypeWhereUniqueInput['id'],
    data: Prisma.CompetitionTypeUpdateInput
  ): Promise<void> {
    await this.prisma.competitionType.update({ where: { id }, data })
  }
  async deleteOneById(id: Prisma.CompetitionTypeWhereUniqueInput['id']): Promise<void> {
    await this.prisma.competitionType.delete({ where: { id } })
  }
}
