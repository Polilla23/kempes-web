import { ITransferRepository, TransferFilters } from '@/features/transfers/interfaces/ITransferRepository'
import { Prisma, PrismaClient, TransferStatus, TransferType } from '@prisma/client'

export class TransferRepository implements ITransferRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  private getDefaultInclude() {
    return {
      player: {
        select: {
          id: true,
          name: true,
          overall: true,
          isKempesita: true,
        },
      },
      fromClub: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      toClub: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      initiatorClub: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      seasonHalf: {
        include: {
          season: true,
        },
      },
      transferWindow: true,
      returnSeasonHalf: {
        include: {
          season: true,
        },
      },
      installments: {
        include: {
          dueSeasonHalf: {
            include: {
              season: true,
            },
          },
        },
        orderBy: {
          installmentNumber: 'asc' as const,
        },
      },
      playersAsPayment: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              overall: true,
            },
          },
        },
      },
    }
  }

  async findAll(filters?: TransferFilters) {
    const where: Prisma.TransferWhereInput = {}

    if (filters?.clubId) {
      where.OR = [{ fromClubId: filters.clubId }, { toClubId: filters.clubId }]
    }
    if (filters?.playerId) {
      where.playerId = filters.playerId
    }
    if (filters?.type) {
      where.type = filters.type
    }
    if (filters?.status) {
      where.status = filters.status
    }
    if (filters?.seasonHalfId) {
      where.seasonHalfId = filters.seasonHalfId
    }
    if (filters?.transferWindowId) {
      where.transferWindowId = filters.transferWindowId
    }

    return await this.prisma.transfer.findMany({
      where,
      include: this.getDefaultInclude(),
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOneById(id: Prisma.TransferWhereUniqueInput['id']) {
    return await this.prisma.transfer.findUnique({
      where: { id },
      include: this.getDefaultInclude(),
    })
  }

  async findByPlayerId(playerId: string) {
    return await this.prisma.transfer.findMany({
      where: { playerId },
      include: this.getDefaultInclude(),
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByClubId(clubId: string, direction?: 'from' | 'to' | 'both') {
    const where: Prisma.TransferWhereInput = {}

    if (direction === 'from') {
      where.fromClubId = clubId
    } else if (direction === 'to') {
      where.toClubId = clubId
    } else {
      where.OR = [{ fromClubId: clubId }, { toClubId: clubId }]
    }

    return await this.prisma.transfer.findMany({
      where,
      include: this.getDefaultInclude(),
      orderBy: { createdAt: 'desc' },
    })
  }

  async findActiveLoans() {
    return await this.prisma.transfer.findMany({
      where: {
        type: {
          in: [TransferType.LOAN_IN, TransferType.LOAN_OUT],
        },
        status: TransferStatus.ACTIVE,
      },
      include: this.getDefaultInclude(),
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPendingInstallments(clubId?: string) {
    const where: Prisma.TransferWhereInput = {
      status: TransferStatus.PARTIALLY_PAID,
      installments: {
        some: {
          status: {
            in: ['PENDING', 'DUE', 'OVERDUE'],
          },
        },
      },
    }

    if (clubId) {
      where.OR = [{ fromClubId: clubId }, { toClubId: clubId }]
    }

    return await this.prisma.transfer.findMany({
      where,
      include: this.getDefaultInclude(),
      orderBy: { createdAt: 'desc' },
    })
  }

  // Obtener transferencias pendientes de confirmación para un club
  // Son transferencias donde el club está involucrado pero NO es el iniciador
  async findPendingConfirmations(clubId: string) {
    return await this.prisma.transfer.findMany({
      where: {
        status: TransferStatus.PENDING,
        initiatorClubId: { not: clubId },
        OR: [{ fromClubId: clubId }, { toClubId: clubId }],
      },
      include: this.getDefaultInclude(),
      orderBy: { createdAt: 'desc' },
    })
  }

  async save(data: Prisma.TransferCreateInput) {
    return await this.prisma.transfer.create({
      data,
      include: this.getDefaultInclude(),
    })
  }

  async updateOneById(id: Prisma.TransferWhereUniqueInput['id'], data: Prisma.TransferUpdateInput) {
    return await this.prisma.transfer.update({
      where: { id },
      data,
      include: this.getDefaultInclude(),
    })
  }

  async deleteOneById(id: Prisma.TransferWhereUniqueInput['id']) {
    return await this.prisma.transfer.delete({ where: { id } })
  }

  // Buscar cuota por ID con su transferencia
  async findInstallmentById(installmentId: string) {
    return await this.prisma.transferInstallment.findUnique({
      where: { id: installmentId },
      include: {
        transfer: {
          include: {
            fromClub: { select: { id: true, name: true } },
            toClub: { select: { id: true, name: true } },
            player: { select: { id: true, fullName: true } },
            installments: { orderBy: { installmentNumber: 'asc' } },
          },
        },
        dueSeasonHalf: { include: { season: true } },
      },
    })
  }

  // Actualizar una cuota
  async updateInstallment(installmentId: string, data: Prisma.TransferInstallmentUpdateInput) {
    return await this.prisma.transferInstallment.update({
      where: { id: installmentId },
      data,
      include: {
        transfer: {
          include: {
            fromClub: { select: { id: true, name: true } },
            toClub: { select: { id: true, name: true } },
            installments: { orderBy: { installmentNumber: 'asc' } },
          },
        },
        dueSeasonHalf: { include: { season: true } },
      },
    })
  }

  // Actualizar cuotas por estado en lote
  async updateInstallmentsByStatus(
    where: Prisma.TransferInstallmentWhereInput,
    data: Prisma.TransferInstallmentUpdateManyMutationInput
  ) {
    return await this.prisma.transferInstallment.updateMany({ where, data })
  }

  // Obtener todas las cuotas con filtros
  async findAllInstallments(filters?: { status?: string; dueSeasonHalfId?: string }) {
    const where: Prisma.TransferInstallmentWhereInput = {}

    if (filters?.status) {
      where.status = filters.status as any
    }
    if (filters?.dueSeasonHalfId) {
      where.dueSeasonHalfId = filters.dueSeasonHalfId
    }

    return await this.prisma.transferInstallment.findMany({
      where,
      include: {
        transfer: {
          include: this.getDefaultInclude(),
        },
        dueSeasonHalf: { include: { season: true } },
      },
      orderBy: { dueSeasonHalf: { season: { number: 'asc' } } },
    })
  }

  // Crear transferencia con cuotas en una transacción
  async createWithInstallments(
    transferData: Prisma.TransferCreateInput,
    installmentsData: Prisma.TransferInstallmentCreateManyInput[]
  ) {
    return await this.prisma.$transaction(async tx => {
      const transfer = await tx.transfer.create({
        data: transferData,
      })

      if (installmentsData.length > 0) {
        await tx.transferInstallment.createMany({
          data: installmentsData.map(inst => ({
            ...inst,
            transferId: transfer.id,
          })),
        })
      }

      return await tx.transfer.findUnique({
        where: { id: transfer.id },
        include: this.getDefaultInclude(),
      })
    })
  }
}
