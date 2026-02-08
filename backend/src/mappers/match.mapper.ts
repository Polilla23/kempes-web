// Crea un mapper para transformar entidades Match a DTOs para no exponer info sensible

import { Match, Club, Competition, CompetitionType, Event, Player, EventType } from '@prisma/client'
import { MatchDTO, MatchListDTO, MatchDetailedDTO, PaginatedResponse } from '@/types'

// Mapeo de EventTypeName del backend a tipo simplificado del frontend
const EVENT_TYPE_MAP: Record<string, string> = {
  GOAL: 'goal',
  YELLOW_CARD: 'yellow',
  RED_CARD: 'red',
  INJURY: 'injury',
  MVP: 'mvp',
}

// Tipo para match con competition incluida
type MatchWithCompetition = Match & {
  homeClub: Club | null
  awayClub: Club | null
  competition: Competition & {
    competitionType: CompetitionType
  }
  events?: (Event & {
    player: Player
    type: EventType
  })[]
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
    const dto: MatchDetailedDTO = {
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

    if (match.events && match.events.length > 0) {
      dto.events = match.events.map((event) => ({
        type: EVENT_TYPE_MAP[event.type.name] || event.type.name.toLowerCase(),
        player: event.player.name,
        team: (event.player.actualClubId === match.homeClubId ? 'home' : 'away') as 'home' | 'away',
      }))
    }

    return dto
  }

  static toDetailedDTOArray(matches: MatchWithCompetition[]): MatchDetailedDTO[] {
    return matches.map((match) => this.toDetailedDTO(match))
  }
}
