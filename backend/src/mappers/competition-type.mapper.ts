import { CompetitionType } from '@prisma/client'
import { CompetitionTypeDTO } from '@/types'

export class CompetitionTypeMapper {
    static toDTO(competitionType: CompetitionType): CompetitionTypeDTO {
        return {
            id: competitionType.id,
            name: competitionType.name.toString(),
            category: competitionType.category.toString(),
            format: competitionType.format.toString(),
            hierarchy: competitionType.hierarchy,
        }
    }

    static toDTOArray(competitionTypes: CompetitionType[]): CompetitionTypeDTO[] {
        return competitionTypes.map(this.toDTO)
    }
}