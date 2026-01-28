import { CompetitionCategory, CompetitionFormat, CompetitionName } from '@prisma/client'

export type CreateCompetitionTypeInput = {
  category: CompetitionCategory
  hierarchy: number
  name: CompetitionName
  format: CompetitionFormat
  trophyImage?: string
}
