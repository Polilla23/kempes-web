import { IKempesitaConfigRepository } from '@/features/kempesita-config/interfaces/IKempesitaConfigRepository'
import { Prisma, PrismaClient } from '@prisma/client'

export class KempesitaConfigRepository implements IKempesitaConfigRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findActive() {
    return await this.prisma.kempesitaConfig.findFirst({
      where: { isActive: true },
    })
  }

  async save(data: Prisma.KempesitaConfigCreateInput) {
    // Desactivar cualquier config activa antes de crear nueva
    await this.prisma.kempesitaConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    return await this.prisma.kempesitaConfig.create({ data })
  }

  async updateOneById(id: string, data: Prisma.KempesitaConfigUpdateInput) {
    return await this.prisma.kempesitaConfig.update({
      where: { id },
      data,
    })
  }
}
