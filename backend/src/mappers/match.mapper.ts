// Crea un mapper para transformar entidades Match a DTOs para no exponer info sensible

import { Match, Club, Competition, CompetitionType } from '@prisma/client'
import { MatchDTO, MatchListDTO, MatchDetailedDTO, PaginatedResponse } from '@/types'

// Tipo para match con competition incluida
type MatchWithCompetition = Match & {
  homeClub: Club | null
  awayClub: Club | null
  competition: Competition & {
    competitionType: CompetitionType
  }
}

export class MatchMapper {
  static toDTO(
    match: Match & {
      homeClub: Club | null
      awayClub: Club | null
    }
  ): MatchDTO {
    return {
      id: match.id,
      competitionId: match.competitionId,
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
      knockoutRound: (match as any).knockoutRound?.toString() || null,
      homePlaceholder: match.homePlaceholder || null,
      awayPlaceholder: match.awayPlaceholder || null,
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
    return matches.map((match) => MatchMapper.toDTO(match))
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

  // Match con información de competencia para filtrado en frontend
  static toDetailedDTO(match: MatchWithCompetition): MatchDetailedDTO {
    return {
      ...this.toDTO(match),
      competition: {
        id: match.competition.id,
        name: match.competition.name,
        competitionType: {
          id: match.competition.competitionType.id,
          name: match.competition.competitionType.name,
          category: match.competition.competitionType.category,
          format: match.competition.competitionType.format,
          hierarchy: match.competition.competitionType.hierarchy,
        },
      },
    }
  }

  static toDetailedDTOArray(matches: MatchWithCompetition[]): MatchDetailedDTO[] {
    return matches.map((match) => this.toDetailedDTO(match))
  }
}
