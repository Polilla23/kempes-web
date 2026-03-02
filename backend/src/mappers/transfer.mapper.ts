import {
  TransferDTO,
  TransferInstallmentDTO,
  TransferPlayerPaymentDTO,
} from '@/types/dto.types'

// Usamos tipos any para mayor flexibilidad con las relaciones de Prisma
type TransferWithRelations = any
type InstallmentWithRelations = any
type PlayerPaymentWithRelations = any

export class TransferMapper {
  static toDTO(transfer: TransferWithRelations): TransferDTO {
    return {
      id: transfer.id,
      type: transfer.type,
      status: transfer.status,
      playerId: transfer.playerId,
      fromClubId: transfer.fromClubId,
      toClubId: transfer.toClubId,
      initiatorClubId: transfer.initiatorClubId,
      transferWindowId: transfer.transferWindowId,
      seasonHalfId: transfer.seasonHalfId,
      totalAmount: transfer.totalAmount,
      numberOfInstallments: transfer.numberOfInstallments,
      loanDurationHalves: transfer.loanDurationHalves,
      returnSeasonHalfId: transfer.returnSeasonHalfId,
      loanFee: transfer.loanFee,
      loanSalaryPercentage: transfer.loanSalaryPercentage,
      notes: transfer.notes,
      createdAt: transfer.createdAt,
      completedAt: transfer.completedAt,
      player: transfer.player
        ? {
            id: transfer.player.id,
            name: transfer.player.name,
            overall: transfer.player.overall,
            position: transfer.player.position,
            isKempesita: transfer.player.isKempesita,
          }
        : undefined,
      fromClub: transfer.fromClub
        ? {
            id: transfer.fromClub.id,
            name: transfer.fromClub.name,
            shortName: transfer.fromClub.shortName,
            logo: transfer.fromClub.logo,
          }
        : undefined,
      toClub: transfer.toClub
        ? {
            id: transfer.toClub.id,
            name: transfer.toClub.name,
            shortName: transfer.toClub.shortName,
            logo: transfer.toClub.logo,
          }
        : undefined,
      initiatorClub: transfer.initiatorClub
        ? {
            id: transfer.initiatorClub.id,
            name: transfer.initiatorClub.name,
            shortName: transfer.initiatorClub.shortName,
            logo: transfer.initiatorClub.logo,
          }
        : undefined,
      seasonHalf: transfer.seasonHalf
        ? {
            id: transfer.seasonHalf.id,
            halfType: transfer.seasonHalf.halfType,
            seasonId: transfer.seasonHalf.seasonId,
          }
        : undefined,
      transferWindow: transfer.transferWindow
        ? {
            id: transfer.transferWindow.id,
            name: transfer.transferWindow.name,
            status: transfer.transferWindow.status,
          }
        : undefined,
      installments: transfer.installments
        ? transfer.installments.map((i: any) => this.toInstallmentDTO(i))
        : undefined,
      playersAsPayment: transfer.playersAsPayment
        ? transfer.playersAsPayment.map((p: any) => this.toPlayerPaymentDTO(p))
        : undefined,
    }
  }

  static toDTOArray(transfers: TransferWithRelations[]): TransferDTO[] {
    return transfers.map((transfer) => this.toDTO(transfer))
  }

  static toInstallmentDTO(installment: InstallmentWithRelations): TransferInstallmentDTO {
    return {
      id: installment.id,
      transferId: installment.transferId,
      installmentNumber: installment.installmentNumber,
      amount: installment.amount,
      dueSeasonHalfId: installment.dueSeasonHalfId,
      status: installment.status,
      paidAt: installment.paidAt,
      dueSeasonHalf: installment.dueSeasonHalf
        ? {
            id: installment.dueSeasonHalf.id,
            halfType: installment.dueSeasonHalf.halfType,
            seasonId: installment.dueSeasonHalf.seasonId,
          }
        : undefined,
    }
  }

  static toInstallmentDTOArray(installments: InstallmentWithRelations[]): TransferInstallmentDTO[] {
    return installments.map((i) => this.toInstallmentDTO(i))
  }

  static toPlayerPaymentDTO(payment: PlayerPaymentWithRelations): TransferPlayerPaymentDTO {
    return {
      id: payment.id,
      transferId: payment.transferId,
      playerId: payment.playerId,
      valuationAmount: payment.valuationAmount,
      player: payment.player
        ? {
            id: payment.player.id,
            name: payment.player.name,
            overall: payment.player.overall,
            position: payment.player.position,
          }
        : undefined,
    }
  }

  static toPlayerPaymentDTOArray(payments: PlayerPaymentWithRelations[]): TransferPlayerPaymentDTO[] {
    return payments.map((p) => this.toPlayerPaymentDTO(p))
  }
}
