import { TransferWindowStatus, Prisma } from '@prisma/client'
import { TransferWindowRepository } from '@/features/transfer-windows/transfer-windows.repository'
import { SeasonHalfRepository } from '@/features/season-halves/season-halves.repository'
import {
  TransferWindowNotFoundError,
  TransferWindowAlreadyOpenError,
  NoActiveTransferWindowError,
  InvalidTransferWindowDatesError,
} from '@/features/transfer-windows/transfer-windows.errors'
import { SeasonHalfNotFoundError } from '@/features/season-halves/season-halves.errors'

export interface CreateTransferWindowInput {
  seasonHalfId: string
  name: string
  startDate: Date
  endDate: Date
}

export class TransferWindowService {
  private transferWindowRepository: TransferWindowRepository
  private seasonHalfRepository: SeasonHalfRepository

  constructor({
    transferWindowRepository,
    seasonHalfRepository,
  }: {
    transferWindowRepository: TransferWindowRepository
    seasonHalfRepository: SeasonHalfRepository
  }) {
    this.transferWindowRepository = transferWindowRepository
    this.seasonHalfRepository = seasonHalfRepository
  }

  async findAllTransferWindows() {
    return await this.transferWindowRepository.findAll()
  }

  async findTransferWindow(id: string) {
    const windowFound = await this.transferWindowRepository.findOneById(id)

    if (!windowFound) {
      throw new TransferWindowNotFoundError()
    }
    return windowFound
  }

  async findBySeasonHalfId(seasonHalfId: string) {
    return await this.transferWindowRepository.findBySeasonHalfId(seasonHalfId)
  }

  async findActiveTransferWindow() {
    const activeWindow = await this.transferWindowRepository.findActive()
    if (!activeWindow) {
      throw new NoActiveTransferWindowError()
    }
    return activeWindow
  }

  async isTransferWindowOpen(): Promise<boolean> {
    const activeWindow = await this.transferWindowRepository.findActive()
    return activeWindow !== null
  }

  async createTransferWindow(input: CreateTransferWindowInput) {
    // Verificar que la media temporada existe
    const seasonHalf = await this.seasonHalfRepository.findOneById(input.seasonHalfId)
    if (!seasonHalf) {
      throw new SeasonHalfNotFoundError()
    }

    // Validar fechas
    if (input.startDate >= input.endDate) {
      throw new InvalidTransferWindowDatesError()
    }

    const data: Prisma.TransferWindowCreateInput = {
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      status: TransferWindowStatus.CLOSED,
      seasonHalf: {
        connect: { id: input.seasonHalfId },
      },
    }

    return await this.transferWindowRepository.save(data)
  }

  async openTransferWindow(id: string) {
    const windowToOpen = await this.transferWindowRepository.findOneById(id)
    if (!windowToOpen) {
      throw new TransferWindowNotFoundError()
    }

    // Verificar que no haya otra ventana abierta
    const existingOpen = await this.transferWindowRepository.findActive()
    if (existingOpen && existingOpen.id !== id) {
      throw new TransferWindowAlreadyOpenError()
    }

    return await this.transferWindowRepository.updateOneById(id, {
      status: TransferWindowStatus.OPEN,
    })
  }

  async closeTransferWindow(id: string) {
    const windowToClose = await this.transferWindowRepository.findOneById(id)
    if (!windowToClose) {
      throw new TransferWindowNotFoundError()
    }

    return await this.transferWindowRepository.updateOneById(id, {
      status: TransferWindowStatus.CLOSED,
    })
  }

  async closeAllTransferWindows() {
    return await this.transferWindowRepository.closeAllOpen()
  }

  async updateTransferWindow(id: string, data: Prisma.TransferWindowUpdateInput) {
    const windowFound = await this.transferWindowRepository.findOneById(id)

    if (!windowFound) {
      throw new TransferWindowNotFoundError()
    }

    // Validar fechas si se están actualizando ambas
    if (data.startDate && data.endDate) {
      const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate as string)
      const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate as string)
      if (startDate >= endDate) {
        throw new InvalidTransferWindowDatesError()
      }
    }

    return await this.transferWindowRepository.updateOneById(id, data)
  }

  async deleteTransferWindow(id: string) {
    const windowFound = await this.transferWindowRepository.findOneById(id)

    if (!windowFound) {
      throw new TransferWindowNotFoundError()
    }

    return await this.transferWindowRepository.deleteOneById(id)
  }
}
