import { TransferWindow, SeasonHalf, Season } from '@prisma/client'
import { TransferWindowDTO, SeasonHalfDTO, PaginatedResponse } from '@/types'
import { SeasonHalfMapper } from './season-half.mapper'

type TransferWindowWithSeasonHalf = TransferWindow & {
  seasonHalf?: (SeasonHalf & { season?: Season | null }) | null
}

export class TransferWindowMapper {
  static toDTO(transferWindow: TransferWindowWithSeasonHalf): TransferWindowDTO {
    const seasonHalfDTO: SeasonHalfDTO = transferWindow.seasonHalf
      ? SeasonHalfMapper.toDTO(transferWindow.seasonHalf)
      : {
          id: transferWindow.seasonHalfId,
          seasonId: '',
          seasonNumber: 0,
          halfType: '',
          startDate: null,
          endDate: null,
          isActive: false,
        }

    return {
      id: transferWindow.id,
      seasonHalfId: transferWindow.seasonHalfId,
      seasonHalf: seasonHalfDTO,
      name: transferWindow.name,
      startDate: transferWindow.startDate.toISOString(),
      endDate: transferWindow.endDate.toISOString(),
      status: transferWindow.status,
    }
  }

  static toDTOArray(transferWindows: TransferWindowWithSeasonHalf[]): TransferWindowDTO[] {
    return transferWindows.map(this.toDTO)
  }

  static toPaginatedDTO(
    transferWindows: TransferWindowWithSeasonHalf[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponse<TransferWindowDTO> {
    return {
      data: this.toDTOArray(transferWindows),
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
      timestamp: new Date().toISOString(),
    }
  }
}
