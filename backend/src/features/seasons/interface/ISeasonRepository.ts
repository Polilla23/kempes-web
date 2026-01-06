import { Season, Prisma } from '@prisma/client'

export interface ISeasonRepository {
  findAll(): Promise<Season[]>
  findOneById(id: string): Promise<Season | null>
  findOneByNumber(number: number): Promise<Season | null>
  findActiveSeason(): Promise<Season | null>
  save(data: Prisma.SeasonCreateInput): Promise<Season>
  updateOneById(id: string, data: Prisma.SeasonUpdateInput): Promise<Season>
  deleteOneById(id: string): Promise<Season>
}
