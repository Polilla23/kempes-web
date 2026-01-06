// Crea un mapper para transformar entidades Club a DTOs para no exponer info sensible

import { Club } from '@prisma/client'
import { ClubDTO, PaginatedResponse } from '@/types'

export class ClubMapper {
  static toDTO(club: Club & { user?: { id: string; email: string } | null}): ClubDTO {
    return {
      id: club.id,
      name: club.name,
      logo: club.logo,
      isActive: club.isActive,
      userId: club.userId || undefined,
      user: club.user ? {
        id: club.user.id,
        email: club.user.email,
      } : undefined,
    }
  }

  static toDTOArray(clubs: Club[]): ClubDTO[] {
    return clubs.map(this.toDTO)
  }

  static toPaginatedDTO(
    clubs: (Club & { user?: { id: string; email: string } | null })[],
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
