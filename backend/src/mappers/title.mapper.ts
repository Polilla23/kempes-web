import { TitleHistory, TitlePointConfig } from '@prisma/client'
import { TitleHistoryDTO, TitlePointConfigDTO } from '@/types'

type TitleHistoryWithRelations = TitleHistory & {
  club: { id: string; name: string; logo: string | null }
  season: { id: string; number: number }
}

export class TitleMapper {
  static toDTO(title: TitleHistoryWithRelations): TitleHistoryDTO {
    return {
      id: title.id,
      clubId: title.club.id,
      clubName: title.club.name,
      clubLogo: title.club.logo,
      seasonId: title.season.id,
      seasonNumber: title.season.number,
      competitionName: title.competitionName,
      type: title.type,
      category: title.category,
    }
  }

  static toDTOArray(titles: TitleHistoryWithRelations[]): TitleHistoryDTO[] {
    return titles.map(this.toDTO)
  }

  static toPointConfigDTO(config: TitlePointConfig): TitlePointConfigDTO {
    return {
      id: config.id,
      competitionName: config.competitionName,
      category: config.category,
      points: config.points,
      isActive: config.isActive,
    }
  }

  static toPointConfigDTOArray(configs: TitlePointConfig[]): TitlePointConfigDTO[] {
    return configs.map(this.toPointConfigDTO)
  }
}
