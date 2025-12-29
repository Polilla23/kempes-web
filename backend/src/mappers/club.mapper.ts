// Crea un mapper para transformar entidades Club a DTOs para no exponer info sensible

import { Club } from '@prisma/client'
import { ClubDTO, PaginatedResponse } from '@/types'

export class ClubMapper {
  static toDTO(club: Club): ClubDTO {
    return {
      id: club.id,
      name: club.name,
      logo: club.logo,
      isActive: club.isActive,
    }
  }

  static toDTOArray(clubs: Club[]): ClubDTO[] {
    return clubs.map(this.toDTO)
  }

  static toPaginatedDTO(
    clubs: Club[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponse<ClubDTO> {
    return {
      data: this.toDTOArray(clubs),
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
