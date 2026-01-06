// Crea un mapper para transformar entidades Player a DTOs para no exponer info sensible

import { Player, Club } from '@prisma/client'
import { PlayerDTO, PlayerStatsDTO } from '@/types'

export class PlayerMapper {
  static toDTO(
    player: Player & {
      actualClub?: Club | null
      ownerClub?: Club | null
    }
  ): PlayerDTO {
    return {
      id: player.id,
      name: player.name,
      lastName: player.lastName,
      birthdate: player.birthdate.toISOString().split('T')[0],
      actualClubId: player.actualClubId,
      ownerClubId: player.ownerClubId,
      actualClub: player.actualClub ? {
        id: player.actualClub.id,
        name: player.actualClub.name,
      } : null,
      ownerClub: player.ownerClub ? {
        id: player.ownerClub.id,
        name: player.ownerClub.name,
      } : null,
      overall: player.overall ?? 0,
      salary: player.salary,
      sofifaId: player.sofifaId,
      transfermarktId: player.transfermarktId,
      isKempesita: player.isKempesita,
      isActive: player.isActive,
    }
  }

  static toDTOArray(players: (Player & { actualClub?: Club | null; ownerClub?: Club | null })[]): PlayerDTO[] {
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
        mvps?: number
      }
    }
  ): PlayerStatsDTO {
    return {
      ...this.toDTO(player),
      stats: player.stats ? {
        ...player.stats,
        mvps: player.stats.mvps || 0,
      } : {
        totalMatches: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        mvps: 0,
      },
    }
  }
}
