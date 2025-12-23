// Crea un mapper para transformar entidades Match a DTOs para no exponer info sensible

import { Match, Club } from '@prisma/client'
import { MatchDTO, MatchListDTO, PaginatedResponse } from '@/types'

export class MatchMapper {
  static toDTO(
    match: Match & {
      homeClub: Club | null
      awayClub: Club | null
    }
  ): MatchDTO {
    return {
      id: match.id,
      homeClub: match.homeClub
        ? {
            id: match.homeClub.id,
            name: match.homeClub.name,
            logo: match.homeClub.logo,
          }
        : {
            id: '',
            name: match.homePlaceholder || 'TBD',
            logo: null,
          },
      awayClub: match.awayClub
        ? {
            id: match.awayClub.id,
            name: match.awayClub.name,
            logo: match.awayClub.logo,
          }
        : {
            id: '',
            name: match.awayPlaceholder || 'TBD',
            logo: null,
          },
      homeClubGoals: match.homeClubGoals,
      awayClubGoals: match.awayClubGoals,
      status: match.status.toString(),
      matchdayOrder: match.matchdayOrder,
      stage: match.stage.toString(),
      ...(match.homeSourcePosition && {
        homeSource: {
          type: 'FROM_MATCH',
          placeholder: match.homePlaceholder || undefined,
        },
      }),
      ...(match.awaySourcePosition && {
        awaySource: {
          type: 'FROM_MATCH',
          placeholder: match.awayPlaceholder || undefined,
        },
      }),
    }
  }

  static toListDTO(
    match: Match & {
      homeClub: Club | null
      awayClub: Club | null
    }
  ): MatchListDTO {
    return {
      id: match.id,
      homeClubName: match.homeClub?.name || match.homePlaceholder || 'TBD',
      awayClubName: match.awayClub?.name || match.awayPlaceholder || 'TBD',
      homeClubLogo: match.homeClub?.logo || null,
      awayClubLogo: match.awayClub?.logo || null,
      homeClubGoals: match.homeClubGoals,
      awayClubGoals: match.awayClubGoals,
      status: match.status.toString(),
      matchdayOrder: match.matchdayOrder,
    }
  }

  static toDTOArray(
    matches: (Match & {
      homeClub: Club | null
      awayClub: Club | null
    })[]
  ): MatchDTO[] {
    return matches.map(this.toDTO)
  }

  static toListDTOArray(
    matches: (Match & {
      homeClub: Club | null
      awayClub: Club | null
    })[]
  ): MatchListDTO[] {
    return matches.map(this.toListDTO)
  }

  static toPaginatedDTO(
    matches: (Match & { homeClub: Club | null; awayClub: Club | null })[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponse<MatchDTO> {
    return {
      data: this.toDTOArray(matches),
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
