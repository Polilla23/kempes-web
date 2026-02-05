import { Prisma, Transfer, TransferStatus, TransferType } from '@prisma/client'

export interface TransferFilters {
  clubId?: string
  playerId?: string
  type?: TransferType
  status?: TransferStatus
  seasonHalfId?: string
  transferWindowId?: string
}

export interface ITransferRepository {
  findAll(filters?: TransferFilters): Promise<Transfer[] | null>
  findOneById(id: Prisma.TransferWhereUniqueInput['id']): Promise<Transfer | null>
  findByPlayerId(playerId: string): Promise<Transfer[] | null>
  findByClubId(clubId: string, direction?: 'from' | 'to' | 'both'): Promise<Transfer[] | null>
  findActiveLoans(): Promise<Transfer[] | null>
  findPendingInstallments(clubId?: string): Promise<Transfer[] | null>
  save(data: Prisma.TransferCreateInput): Promise<Transfer>
  updateOneById(id: Prisma.TransferWhereUniqueInput['id'], data: Prisma.TransferUpdateInput): Promise<Transfer>
  deleteOneById(id: Prisma.TransferWhereUniqueInput['id']): Promise<Transfer>
}
