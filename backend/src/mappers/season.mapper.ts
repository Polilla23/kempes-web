import { Season } from '@prisma/client'
import { SeasonDTO } from '@/types'

export class SeasonMapper {
  static toDTO(season: Season): SeasonDTO {
    return {
      id: season.id,
      number: season.number,
      isActive: season.isActive,
    }
  }

  static toDTOArray(seasons: Season[]): SeasonDTO[] {
    return seasons.map(this.toDTO)
  }
}
