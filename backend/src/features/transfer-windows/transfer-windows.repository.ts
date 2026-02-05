import { ITransferWindowRepository } from '@/features/transfer-windows/interfaces/ITransferWindowRepository'
import { Prisma, PrismaClient, TransferWindowStatus } from '@prisma/client'

export class TransferWindowRepository implements ITransferWindowRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findAll() {
    return await this.prisma.transferWindow.findMany({
      include: {
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
      orderBy: [
        { seasonHalf: { season: { number: 'desc' } } },
        { startDate: 'desc' },
      ],
    })
  }

  async findOneById(id: Prisma.TransferWindowWhereUniqueInput['id']) {
    return await this.prisma.transferWindow.findUnique({
      where: { id },
      include: {
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
    })
  }

  async findBySeasonHalfId(seasonHalfId: string) {
    return await this.prisma.transferWindow.findMany({
      where: { seasonHalfId },
      include: {
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    })
  }

  async findActive() {
    return await this.prisma.transferWindow.findFirst({
      where: { status: TransferWindowStatus.OPEN },
      include: {
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
    })
  }

  async findByStatus(status: TransferWindowStatus) {
    return await this.prisma.transferWindow.findMany({
      where: { status },
      include: {
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    })
  }

  async save(data: Prisma.TransferWindowCreateInput) {
    return await this.prisma.transferWindow.create({
      data,
      include: {
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
    })
  }

  async updateOneById(id: Prisma.TransferWindowWhereUniqueInput['id'], data: Prisma.TransferWindowUpdateInput) {
    return await this.prisma.transferWindow.update({
      where: { id },
      data,
      include: {
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
    })
  }

  async deleteOneById(id: Prisma.TransferWindowWhereUniqueInput['id']) {
    return await this.prisma.transferWindow.delete({ where: { id } })
  }

  // Cerrar todas las ventanas abiertas
  async closeAllOpen() {
    return await this.prisma.transferWindow.updateMany({
      where: { status: TransferWindowStatus.OPEN },
      data: { status: TransferWindowStatus.CLOSED },
    })
  }
}
