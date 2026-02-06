import { Prisma, TransferWindow, TransferWindowStatus } from '@prisma/client'

export interface ITransferWindowRepository {
  findAll(): Promise<TransferWindow[] | null>
  findOneById(id: Prisma.TransferWindowWhereUniqueInput['id']): Promise<TransferWindow | null>
  findBySeasonHalfId(seasonHalfId: string): Promise<TransferWindow[] | null>
  findActive(): Promise<TransferWindow | null>
  findByStatus(status: TransferWindowStatus): Promise<TransferWindow[] | null>
  save(data: Prisma.TransferWindowCreateInput): Promise<TransferWindow>
  updateOneById(id: Prisma.TransferWindowWhereUniqueInput['id'], data: Prisma.TransferWindowUpdateInput): Promise<TransferWindow>
  deleteOneById(id: Prisma.TransferWindowWhereUniqueInput['id']): Promise<TransferWindow>
}
