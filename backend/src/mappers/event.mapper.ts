// Crea un mapper para transformar entidades Event a DTOs para no exponer info sensible

import { Event, Player, Club, EventType } from '@prisma/client'
import { EventDTO } from '@/types'

export class EventMapper {
  static toDTO(
    event: Event & {
      player: Player
      type: EventType
      match: {
        homeClub: Club | null
        awayClub: Club | null
      }
    }
  ): EventDTO {
    const playerClub =
      event.match.homeClub?.id === event.player.actualClubId ? event.match.homeClub : event.match.awayClub

    return {
      id: event.id,
      type: event.type.name.toString(),
      player: {
        id: event.player.id,
        name: event.player.name,
        jerseyNumber: null,
      },
      club: {
        id: playerClub?.id || '',
        name: playerClub?.name || 'Unknown',
      },
      description: null,
      minute: 0,
    }
  }

  static toDTOArray(
    events: (Event & {
      player: Player
      type: EventType
      match: {
        homeClub: Club | null
        awayClub: Club | null
      }
    })[]
  ): EventDTO[] {
    return events.map(this.toDTO)
  }
}
