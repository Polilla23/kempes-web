import { SeasonHalf, Season } from '@prisma/client'
import { SeasonHalfDTO, PaginatedResponse } from '@/types'

type SeasonHalfWithSeason = SeasonHalf & { season?: Season | null }

export class SeasonHalfMapper {
  static toDTO(seasonHalf: SeasonHalfWithSeason): SeasonHalfDTO {
    return {
      id: seasonHalf.id,
      seasonId: seasonHalf.seasonId,
      seasonNumber: seasonHalf.season?.number ?? 0,
      halfType: seasonHalf.halfType,
      startDate: seasonHalf.startDate?.toISOString() ?? null,
      endDate: seasonHalf.endDate?.toISOString() ?? null,
      isActive: seasonHalf.isActive,
    }
  }

  static toDTOArray(seasonHalves: SeasonHalfWithSeason[]): SeasonHalfDTO[] {
    return seasonHalves.map(this.toDTO)
  }

  static toPaginatedDTO(
    seasonHalves: SeasonHalfWithSeason[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponse<SeasonHalfDTO> {
    return {
      data: this.toDTOArray(seasonHalves),
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
