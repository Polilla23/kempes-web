import {
  TransferType,
  TransferStatus,
  InstallmentStatus,
  Prisma,
  SeasonHalfType,
} from '@prisma/client'
import { TransferRepository } from '@/features/transfers/transfers.repository'
import { TransferFilters } from '@/features/transfers/interfaces/ITransferRepository'
import { SeasonHalfRepository } from '@/features/season-halves/season-halves.repository'
import { TransferWindowRepository } from '@/features/transfer-windows/transfer-windows.repository'
import { PlayerRepository } from '@/features/players/players.repository'
import { ClubRepository } from '@/features/clubs/clubs.repository'
import { FinanceService } from '@/features/finances/finances.service'
import {
  TransferNotFoundError,
  TransferWindowClosedError,
  PlayerAlreadyInClubError,
  InvalidTransferTypeError,
  TransferAlreadyCompletedError,
  NoActiveSeasonHalfError,
  InvalidInstallmentCountError,
  InstallmentNotFoundError,
  InstallmentAlreadyPaidError,
  RosterLimitExceededError,
} from '@/features/transfers/transfers.errors'

// Input types
export interface CreateTransferInput {
  type: TransferType
  playerId: string
  fromClubId: string
  toClubId: string
  initiatorClubId: string // Club que inicia la transferencia
  totalAmount: number
  numberOfInstallments: number
  transferWindowId?: string
  installments?: Array<{
    amount: number
    dueSeasonHalfId: string
  }>
  playersAsPayment?: Array<{
    playerId: string
    valuationAmount: number
  }>
  notes?: string
}

export interface CreateLoanInput {
  playerId: string
  fromClubId: string
  toClubId: string
  loanDurationHalves: number
  loanFee?: number
  numberOfInstallments?: number
  loanSalaryPercentage?: number
  transferWindowId?: string
  notes?: string
}

export interface CreateAuctionInput {
  playerId: string
  toClubId: string
  auctionPrice: number
  notes?: string
}

export interface SignFreeAgentInput {
  playerId: string
  toClubId: string
  signingFee: number
  notes?: string
}

const MAX_ROSTER_SENIOR = 30
const MAX_ROSTER_KEMPESITA = 30

export class TransferService {
  private transferRepository: TransferRepository
  private seasonHalfRepository: SeasonHalfRepository
  private transferWindowRepository: TransferWindowRepository
  private playerRepository: PlayerRepository
  private clubRepository: ClubRepository
  private financeService: FinanceService

  constructor({
    transferRepository,
    seasonHalfRepository,
    transferWindowRepository,
    playerRepository,
    clubRepository,
    financeService,
  }: {
    transferRepository: TransferRepository
    seasonHalfRepository: SeasonHalfRepository
    transferWindowRepository: TransferWindowRepository
    playerRepository: PlayerRepository
    clubRepository: ClubRepository
    financeService: FinanceService
  }) {
    this.transferRepository = transferRepository
    this.seasonHalfRepository = seasonHalfRepository
    this.transferWindowRepository = transferWindowRepository
    this.playerRepository = playerRepository
    this.clubRepository = clubRepository
    this.financeService = financeService
  }

  async findAllTransfers(filters?: TransferFilters) {
    return await this.transferRepository.findAll(filters)
  }

  async findTransfer(id: string) {
    const transfer = await this.transferRepository.findOneById(id)
    if (!transfer) {
      throw new TransferNotFoundError()
    }
    return transfer
  }

  async findByPlayerId(playerId: string) {
    return await this.transferRepository.findByPlayerId(playerId)
  }

  async findByClubId(clubId: string, direction?: 'from' | 'to' | 'both') {
    return await this.transferRepository.findByClubId(clubId, direction)
  }

  async findActiveLoans() {
    return await this.transferRepository.findActiveLoans()
  }

  // Obtener transferencias pendientes de confirmación para un club
  async findPendingConfirmations(clubId: string) {
    return await this.transferRepository.findPendingConfirmations(clubId)
  }

  // Obtener el conteo de roster activo de un club
  async getClubRosterCount(clubId: string): Promise<{ senior: number; kempesita: number }> {
    const players = await this.playerRepository.findAll()
    const clubPlayers = players?.filter(p => p.actualClubId === clubId && p.isActive) ?? []

    return {
      senior: clubPlayers.filter(p => !p.isKempesita).length,
      kempesita: clubPlayers.filter(p => p.isKempesita).length,
    }
  }

  // Validar límite de roster antes de transferencia
  async validateRosterLimit(clubId: string, isKempesita: boolean): Promise<void> {
    const roster = await this.getClubRosterCount(clubId)

    if (isKempesita) {
      if (roster.kempesita >= MAX_ROSTER_KEMPESITA) {
        throw new RosterLimitExceededError('KEMPESITA', roster.kempesita, MAX_ROSTER_KEMPESITA)
      }
    } else {
      if (roster.senior >= MAX_ROSTER_SENIOR) {
        throw new RosterLimitExceededError('SENIOR', roster.senior, MAX_ROSTER_SENIOR)
      }
    }
  }

  // Obtener la media temporada activa
  async getActiveSeasonHalf() {
    const activeHalf = await this.seasonHalfRepository.findActive()
    if (!activeHalf) {
      throw new NoActiveSeasonHalfError()
    }
    return activeHalf
  }

  // Generar cuotas para una transferencia
  async generateInstallments(
    transferId: string,
    totalAmount: number,
    numberOfInstallments: number,
    startingSeasonHalfId: string
  ): Promise<Prisma.TransferInstallmentCreateManyInput[]> {
    if (numberOfInstallments < 1) {
      throw new InvalidInstallmentCountError('Number of installments must be at least 1')
    }

    const installmentAmount = totalAmount / numberOfInstallments
    const installments: Prisma.TransferInstallmentCreateManyInput[] = []

    // Obtener todas las medias temporadas futuras para asignar vencimientos
    const allSeasonHalves = await this.seasonHalfRepository.findAll()
    if (!allSeasonHalves) {
      throw new Error('No season halves found')
    }

    // Ordenar por temporada y tipo de media
    const sortedHalves = allSeasonHalves.sort((a, b) => {
      const seasonA = (a as any).season?.number ?? 0
      const seasonB = (b as any).season?.number ?? 0
      if (seasonA !== seasonB) return seasonA - seasonB
      return a.halfType === SeasonHalfType.FIRST_HALF ? -1 : 1
    })

    // Encontrar el índice de la media temporada inicial
    const startIndex = sortedHalves.findIndex(h => h.id === startingSeasonHalfId)
    if (startIndex === -1) {
      throw new Error('Starting season half not found')
    }

    // Generar cuotas
    for (let i = 0; i < numberOfInstallments; i++) {
      const halfIndex = startIndex + i
      if (halfIndex >= sortedHalves.length) {
        // Si no hay suficientes medias temporadas, usar la última disponible
        break
      }

      installments.push({
        transferId,
        installmentNumber: i + 1,
        amount: installmentAmount,
        dueSeasonHalfId: sortedHalves[halfIndex].id,
        status: i === 0 ? InstallmentStatus.DUE : InstallmentStatus.PENDING,
      })
    }

    return installments
  }

  // Crear transferencia de compra/venta (queda en PENDING hasta que el otro club apruebe)
  async createTransfer(input: CreateTransferInput) {
    // Validar que hay una media temporada activa
    const activeSeasonHalf = await this.getActiveSeasonHalf()

    // Validar ventana de transferencia abierta (excepto para subastas)
    if (input.type !== TransferType.AUCTION) {
      const activeWindow = await this.transferWindowRepository.findActive()
      if (!activeWindow && input.type !== TransferType.INACTIVE_STATUS) {
        throw new TransferWindowClosedError()
      }
    }

    // Obtener jugador
    const player = await this.playerRepository.findOneById(input.playerId)
    if (!player) {
      throw new Error('Player not found')
    }

    // Validar que el jugador no está ya en el club destino
    if (player.actualClubId === input.toClubId) {
      throw new PlayerAlreadyInClubError()
    }

    // Validar límite de roster del club destino
    await this.validateRosterLimit(input.toClubId, player.isKempesita)

    // La transferencia comienza en PENDING hasta que el otro club la apruebe
    // El jugador NO se mueve hasta la aprobación
    const initialStatus = TransferStatus.PENDING

    // Crear la transferencia
    const transferData: Prisma.TransferCreateInput = {
      type: input.type,
      status: initialStatus,
      totalAmount: input.totalAmount,
      numberOfInstallments: input.numberOfInstallments,
      notes: input.notes,
      player: { connect: { id: input.playerId } },
      fromClub: { connect: { id: input.fromClubId } },
      toClub: { connect: { id: input.toClubId } },
      initiatorClub: { connect: { id: input.initiatorClubId } },
      seasonHalf: { connect: { id: activeSeasonHalf.id } },
      ...(input.transferWindowId && {
        transferWindow: { connect: { id: input.transferWindowId } },
      }),
    }

    // Generar cuotas - si el usuario proporciona cuotas personalizadas, usarlas
    let installmentsData: Prisma.TransferInstallmentCreateManyInput[]

    if (input.installments && input.installments.length > 0) {
      // Usar las cuotas personalizadas del usuario
      installmentsData = input.installments.map((inst, index) => ({
        transferId: '',
        installmentNumber: index + 1,
        amount: inst.amount,
        dueSeasonHalfId: inst.dueSeasonHalfId,
        status: index === 0 ? InstallmentStatus.DUE : InstallmentStatus.PENDING,
      }))
    } else {
      // Generar cuotas automáticamente
      installmentsData = await this.generateInstallments(
        '',
        input.totalAmount,
        input.numberOfInstallments,
        activeSeasonHalf.id
      )
    }

    // Crear en transacción (sin mover el jugador - se mueve al aprobar)
    const transfer = await this.transferRepository.createWithInstallments(transferData, installmentsData)

    return transfer
  }

  // Crear préstamo
  async createLoan(input: CreateLoanInput) {
    const activeSeasonHalf = await this.getActiveSeasonHalf()

    // Validar ventana de transferencia
    const activeWindow = await this.transferWindowRepository.findActive()
    if (!activeWindow) {
      throw new TransferWindowClosedError()
    }

    // Obtener jugador
    const player = await this.playerRepository.findOneById(input.playerId)
    if (!player) {
      throw new Error('Player not found')
    }

    // Validar que el jugador no está ya en el club destino
    if (player.actualClubId === input.toClubId) {
      throw new PlayerAlreadyInClubError()
    }

    // Validar límite de roster
    await this.validateRosterLimit(input.toClubId, player.isKempesita)

    // Calcular fecha de retorno (media temporada de retorno)
    const allSeasonHalves = await this.seasonHalfRepository.findAll()
    if (!allSeasonHalves) {
      throw new Error('No season halves found')
    }

    const sortedHalves = allSeasonHalves.sort((a, b) => {
      const seasonA = (a as any).season?.number ?? 0
      const seasonB = (b as any).season?.number ?? 0
      if (seasonA !== seasonB) return seasonA - seasonB
      return a.halfType === SeasonHalfType.FIRST_HALF ? -1 : 1
    })

    const currentIndex = sortedHalves.findIndex(h => h.id === activeSeasonHalf.id)
    const returnIndex = currentIndex + input.loanDurationHalves
    const returnSeasonHalf = sortedHalves[Math.min(returnIndex, sortedHalves.length - 1)]

    // Crear transferencias para ambos clubes (LOAN_OUT para el dueño, referencia)
    const loanOutData: Prisma.TransferCreateInput = {
      type: TransferType.LOAN_OUT,
      status: TransferStatus.ACTIVE,
      totalAmount: input.loanFee ?? 0,
      numberOfInstallments: input.numberOfInstallments ?? 1,
      loanDurationHalves: input.loanDurationHalves,
      loanFee: input.loanFee,
      loanSalaryPercentage: input.loanSalaryPercentage ?? 100,
      notes: input.notes,
      player: { connect: { id: input.playerId } },
      fromClub: { connect: { id: input.fromClubId } },
      toClub: { connect: { id: input.toClubId } },
      seasonHalf: { connect: { id: activeSeasonHalf.id } },
      returnSeasonHalf: { connect: { id: returnSeasonHalf.id } },
      ...(input.transferWindowId && {
        transferWindow: { connect: { id: input.transferWindowId } },
      }),
    }

    const loanInstallments =
      input.loanFee && input.loanFee > 0
        ? await this.generateInstallments(
            '',
            input.loanFee,
            input.numberOfInstallments ?? 1,
            activeSeasonHalf.id
          )
        : []

    const loan = await this.transferRepository.createWithInstallments(loanOutData, loanInstallments)

    // Actualizar jugador: actualClub cambia pero ownerClub permanece
    if (loan) {
      await this.playerRepository.updateOneById(input.playerId, {
        actualClub: { connect: { id: input.toClubId } },
        // ownerClub permanece igual
      })
    }

    return loan
  }

  // Crear subasta
  async createAuction(input: CreateAuctionInput) {
    const activeSeasonHalf = await this.getActiveSeasonHalf()

    // Obtener jugador
    const player = await this.playerRepository.findOneById(input.playerId)
    if (!player) {
      throw new Error('Player not found')
    }

    // Validar límite de roster
    await this.validateRosterLimit(input.toClubId, player.isKempesita)

    const fromClubId = player.ownerClubId

    const transferData: Prisma.TransferCreateInput = {
      type: TransferType.AUCTION,
      status: TransferStatus.COMPLETED, // Subastas son pago único
      totalAmount: input.auctionPrice,
      numberOfInstallments: 1,
      notes: input.notes,
      player: { connect: { id: input.playerId } },
      fromClub: { connect: { id: fromClubId } },
      toClub: { connect: { id: input.toClubId } },
      seasonHalf: { connect: { id: activeSeasonHalf.id } },
    }

    const installments = await this.generateInstallments('', input.auctionPrice, 1, activeSeasonHalf.id)

    const transfer = await this.transferRepository.createWithInstallments(transferData, installments)

    // Actualizar jugador
    if (transfer) {
      await this.playerRepository.updateOneById(input.playerId, {
        actualClub: { connect: { id: input.toClubId } },
        ownerClub: { connect: { id: input.toClubId } },
      })
    }

    return transfer
  }

  // Fichar agente libre
  async signFreeAgent(input: SignFreeAgentInput, freeClubId: string) {
    const activeSeasonHalf = await this.getActiveSeasonHalf()

    // Validar ventana abierta
    const activeWindow = await this.transferWindowRepository.findActive()
    if (!activeWindow) {
      throw new TransferWindowClosedError()
    }

    // Obtener jugador
    const player = await this.playerRepository.findOneById(input.playerId)
    if (!player) {
      throw new Error('Player not found')
    }

    // Validar que el jugador está en el club LIBRE
    if (player.actualClubId !== freeClubId && player.ownerClubId !== freeClubId) {
      throw new InvalidTransferTypeError('Player is not a free agent')
    }

    // Validar límite de roster
    await this.validateRosterLimit(input.toClubId, player.isKempesita)

    const transferData: Prisma.TransferCreateInput = {
      type: TransferType.FREE_AGENT,
      status: TransferStatus.COMPLETED,
      totalAmount: input.signingFee,
      numberOfInstallments: 1,
      notes: input.notes,
      player: { connect: { id: input.playerId } },
      fromClub: { connect: { id: freeClubId } },
      toClub: { connect: { id: input.toClubId } },
      seasonHalf: { connect: { id: activeSeasonHalf.id } },
    }

    const installments = await this.generateInstallments('', input.signingFee, 1, activeSeasonHalf.id)

    const transfer = await this.transferRepository.createWithInstallments(transferData, installments)

    // Actualizar jugador
    if (transfer) {
      await this.playerRepository.updateOneById(input.playerId, {
        actualClub: { connect: { id: input.toClubId } },
        ownerClub: { connect: { id: input.toClubId } },
      })
    }

    return transfer
  }

  // Marcar jugador como inactivo
  async markPlayerInactive(playerId: string, clubId: string) {
    const activeSeasonHalf = await this.getActiveSeasonHalf()

    const player = await this.playerRepository.findOneById(playerId)
    if (!player) {
      throw new Error('Player not found')
    }

    if (player.actualClubId !== clubId) {
      throw new Error('Player does not belong to this club')
    }

    // Crear registro de pase inactivo
    const transferData: Prisma.TransferCreateInput = {
      type: TransferType.INACTIVE_STATUS,
      status: TransferStatus.COMPLETED,
      totalAmount: 0,
      numberOfInstallments: 0,
      notes: 'Player marked as inactive',
      player: { connect: { id: playerId } },
      fromClub: { connect: { id: clubId } },
      toClub: { connect: { id: clubId } },
      seasonHalf: { connect: { id: activeSeasonHalf.id } },
    }

    const transfer = await this.transferRepository.save(transferData)

    // Marcar jugador como inactivo
    await this.playerRepository.updateOneById(playerId, {
      isActive: false,
    })

    return transfer
  }

  // Completar transferencia
  async completeTransfer(id: string) {
    const transfer = await this.transferRepository.findOneById(id)
    if (!transfer) {
      throw new TransferNotFoundError()
    }

    if (transfer.status === TransferStatus.COMPLETED) {
      throw new TransferAlreadyCompletedError()
    }

    return await this.transferRepository.updateOneById(id, {
      status: TransferStatus.COMPLETED,
      completedAt: new Date(),
    })
  }

  // Cancelar transferencia
  async cancelTransfer(id: string) {
    const transfer = await this.transferRepository.findOneById(id)
    if (!transfer) {
      throw new TransferNotFoundError()
    }

    if (transfer.status === TransferStatus.COMPLETED) {
      throw new TransferAlreadyCompletedError()
    }

    // Revertir el movimiento del jugador
    await this.playerRepository.updateOneById(transfer.playerId, {
      actualClub: { connect: { id: transfer.fromClubId } },
      ownerClub: { connect: { id: transfer.fromClubId } },
    })

    return await this.transferRepository.updateOneById(id, {
      status: TransferStatus.CANCELLED,
    })
  }

  async deleteTransfer(id: string) {
    const transfer = await this.transferRepository.findOneById(id)
    if (!transfer) {
      throw new TransferNotFoundError()
    }

    return await this.transferRepository.deleteOneById(id)
  }

  // Aprobar una transferencia pendiente - mueve el jugador y cambia status
  async approveTransfer(id: string) {
    const transfer = await this.transferRepository.findOneById(id)
    if (!transfer) {
      throw new TransferNotFoundError()
    }

    if (transfer.status !== TransferStatus.PENDING) {
      throw new Error('Transfer is not pending approval')
    }

    // Determinar el nuevo status según las cuotas
    const newStatus =
      transfer.numberOfInstallments > 1 ? TransferStatus.PARTIALLY_PAID : TransferStatus.COMPLETED

    // Actualizar la transferencia
    const updatedTransfer = await this.transferRepository.updateOneById(id, {
      status: newStatus,
      ...(newStatus === TransferStatus.COMPLETED && { completedAt: new Date() }),
    })

    // AHORA mover el jugador al nuevo club
    if (transfer.type === TransferType.LOAN_OUT || transfer.type === TransferType.LOAN_IN) {
      // Para préstamos: solo actualClub cambia, ownerClub permanece
      await this.playerRepository.updateOneById(transfer.playerId, {
        actualClub: { connect: { id: transfer.toClubId } },
      })
    } else {
      // Para compras/ventas: ambos cambian
      await this.playerRepository.updateOneById(transfer.playerId, {
        actualClub: { connect: { id: transfer.toClubId } },
        ownerClub: { connect: { id: transfer.toClubId } },
      })
    }

    return updatedTransfer
  }

  // Rechazar una transferencia pendiente - la cancela sin mover el jugador
  async rejectTransfer(id: string) {
    const transfer = await this.transferRepository.findOneById(id)
    if (!transfer) {
      throw new TransferNotFoundError()
    }

    if (transfer.status !== TransferStatus.PENDING) {
      throw new Error('Transfer is not pending approval')
    }

    // Simplemente cancelar - el jugador nunca se movió
    return await this.transferRepository.updateOneById(id, {
      status: TransferStatus.CANCELLED,
    })
  }

  // ==================== Installment Management ====================

  // Pagar una cuota de transferencia
  async payInstallment(installmentId: string) {
    const installment = await this.transferRepository.findInstallmentById(installmentId)
    if (!installment) {
      throw new InstallmentNotFoundError()
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new InstallmentAlreadyPaidError()
    }

    if (installment.status === InstallmentStatus.PENDING) {
      throw new Error('Cannot pay a PENDING installment. It must be DUE or OVERDUE first.')
    }

    const transfer = installment.transfer

    // Obtener la media temporada activa para las transacciones
    const activeSeasonHalf = await this.getActiveSeasonHalf()

    // Marcar la cuota como PAID
    const updatedInstallment = await this.transferRepository.updateInstallment(installmentId, {
      status: InstallmentStatus.PAID,
      paidAt: new Date(),
    })

    // Crear transacción TRANSFER_EXPENSE para el club comprador (toClub)
    await this.financeService.createTransaction({
      clubId: transfer.toClubId,
      type: 'TRANSFER_EXPENSE',
      amount: -Math.abs(installment.amount),
      description: `Cuota ${installment.installmentNumber}/${transfer.numberOfInstallments} - ${transfer.player.name} ${transfer.player.lastName}`,
      transferId: transfer.id,
      installmentId: installment.id,
      seasonHalfId: activeSeasonHalf.id,
    })

    // Crear transacción TRANSFER_INCOME para el club vendedor (fromClub)
    await this.financeService.createTransaction({
      clubId: transfer.fromClubId,
      type: 'TRANSFER_INCOME',
      amount: Math.abs(installment.amount),
      description: `Cuota ${installment.installmentNumber}/${transfer.numberOfInstallments} - ${transfer.player.name} ${transfer.player.lastName}`,
      transferId: transfer.id,
      seasonHalfId: activeSeasonHalf.id,
    })

    // Verificar si TODAS las cuotas están pagadas → completar transfer
    const allInstallments = transfer.installments
    const allPaid = allInstallments.every(
      (inst) => inst.id === installmentId || inst.status === InstallmentStatus.PAID
    )

    if (allPaid) {
      await this.transferRepository.updateOneById(transfer.id, {
        status: TransferStatus.COMPLETED,
        completedAt: new Date(),
      })
    }

    return updatedInstallment
  }

  // Actualizar estados de cuotas al cambiar de media temporada
  async updateInstallmentStatuses(currentSeasonHalfId: string) {
    // Obtener todas las medias temporadas ordenadas
    const allSeasonHalves = await this.seasonHalfRepository.findAll()
    if (!allSeasonHalves) {
      throw new Error('No season halves found')
    }

    const sortedHalves = allSeasonHalves.sort((a, b) => {
      const seasonA = (a as any).season?.number ?? 0
      const seasonB = (b as any).season?.number ?? 0
      if (seasonA !== seasonB) return seasonA - seasonB
      return a.halfType === SeasonHalfType.FIRST_HALF ? -1 : 1
    })

    const currentIndex = sortedHalves.findIndex(h => h.id === currentSeasonHalfId)
    if (currentIndex === -1) {
      throw new Error('Current season half not found')
    }

    // IDs de medias temporadas anteriores a la actual
    const previousHalfIds = sortedHalves.slice(0, currentIndex).map(h => h.id)

    // PENDING → DUE para cuotas cuyo dueSeasonHalfId === currentSeasonHalfId
    const markedDue = await this.transferRepository.updateInstallmentsByStatus(
      {
        status: InstallmentStatus.PENDING,
        dueSeasonHalfId: currentSeasonHalfId,
      },
      { status: InstallmentStatus.DUE }
    )

    // DUE → OVERDUE para cuotas cuyo dueSeasonHalfId es de una media temporada anterior
    let markedOverdue = { count: 0 }
    if (previousHalfIds.length > 0) {
      markedOverdue = await this.transferRepository.updateInstallmentsByStatus(
        {
          status: InstallmentStatus.DUE,
          dueSeasonHalfId: { in: previousHalfIds },
        },
        { status: InstallmentStatus.OVERDUE }
      )
    }

    return {
      markedDue: markedDue.count,
      markedOverdue: markedOverdue.count,
    }
  }

  // Obtener cuotas pendientes/vencidas
  async findPendingInstallments() {
    return await this.transferRepository.findAllInstallments({
      status: undefined, // We filter in UI
    })
  }
}
