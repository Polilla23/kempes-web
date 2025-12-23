// Crea un mapper para transformar entidades Competition a DTOs para no exponer info sensible

import { Competition } from '@prisma/client'
import { CompetitionDTO } from '@/types'

export class CompetitionMapper {
  static toDTO(
    competition: Competition,
    competitionTypeData: {
      id: string
      name: string
      category: string
      format: string
    }
  ): CompetitionDTO {
    return {
      id: competition.id,
      name: competition.name,
      seasonId: competition.seasonId,
      competitionTypeId: competition.competitionTypeId,
      isActive: competition.isActive,
      competitionType: {
        id: competitionTypeData.id,
        name: competitionTypeData.name,
        category: competitionTypeData.category,
        format: competitionTypeData.format,
      },
      _count: { matches: 0, clubs: 0 },
    }
  }

  static toDTOArray(
    competitions: Competition[],
    competitionTypesData: Map<
      string,
      {
        id: string
        name: string
        category: string
        format: string
      }
    >
  ): CompetitionDTO[] {
    return competitions.map((comp) => {
      const typeData = competitionTypesData.get(comp.competitionTypeId)
      if (!typeData) {
        throw new Error(`Competition type data not found for competition ${comp.id}`)
      }
      return this.toDTO(comp, typeData)
    })
  }
}
