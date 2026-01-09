import { ISalaryRateRepository } from '@/features/salary-rates/interfaces/ISalaryRateRepository'
import { Prisma, PrismaClient } from '@prisma/client'

export class SalaryRateRepository implements ISalaryRateRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findAll() {
    return await this.prisma.salaryRate.findMany({
      where: { isActive: true },
      orderBy: { minOverall: 'asc' },
    })
  }

  async findOneById(id: Prisma.SalaryRateWhereUniqueInput['id']) {
    return await this.prisma.salaryRate.findUnique({ where: { id } })
  }

  async save(data: Prisma.SalaryRateCreateInput) {
    return await this.prisma.salaryRate.create({ data })
  }

  async deleteOneById(id: Prisma.SalaryRateWhereUniqueInput['id']) {
    return await this.prisma.salaryRate.delete({ where: { id } })
  }

  async updateOneById(id: Prisma.SalaryRateWhereUniqueInput['id'], data: Prisma.SalaryRateUpdateInput) {
    return await this.prisma.salaryRate.update({
      where: { id },
      data,
    })
  }
}
