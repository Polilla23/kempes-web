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
      hierarchy: number
    }
  ): CompetitionDTO {
    return {
      id: competition.id,
      name: competition.name,
      seasonId: competition.seasonId,
      competitionTypeId: competition.competitionTypeId,
      isActive: competition.isActive,
      system: competition.system,
      parentCompetitionId: competition.parentCompetitionId || null,
      competitionType: {
        id: competitionTypeData.id,
        name: competitionTypeData.name,
        category: competitionTypeData.category,
        format: competitionTypeData.format,
        hierarchy: competitionTypeData.hierarchy,
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
        hierarchy: number
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
