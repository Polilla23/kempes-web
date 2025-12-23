// Crea un mapper para transformar entidades Player a DTOs para no exponer info sensible

import { Player, Club } from '@prisma/client'
import { PlayerDTO, PlayerStatsDTO } from '@/types'

export class PlayerMapper {
  static toDTO(
    player: Player & {
      actualClub?: Club
    }
  ): PlayerDTO {
    return {
      id: player.id,
      name: player.name,
      lastName: player.lastName,
      birthdate: player.birthdate.toISOString().split('T')[0],
      actualClubId: player.actualClubId,
      overall: player.overall ?? 0,
    }
  }

  static toDTOArray(players: (Player & { actualClub?: Club })[]): PlayerDTO[] {
    return players.map(this.toDTO)
  }

  static toStatsDTO(
    player: Player & {
      actualClub?: Club
      stats?: {
        totalMatches: number
        goals: number
        assists: number
        yellowCards: number
        redCards: number
      }
    }
  ): PlayerStatsDTO {
    return {
      ...this.toDTO(player),
      stats: player.stats || {
        totalMatches: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
      },
    }
  }
}
