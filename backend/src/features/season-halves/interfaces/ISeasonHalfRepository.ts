import { Prisma, SeasonHalf } from '@prisma/client'

export interface ISeasonHalfRepository {
  findAll(): Promise<SeasonHalf[] | null>
  findOneById(id: Prisma.SeasonHalfWhereUniqueInput['id']): Promise<SeasonHalf | null>
  findBySeasonId(seasonId: string): Promise<SeasonHalf[] | null>
  findActive(): Promise<SeasonHalf | null>
  findBySeasonAndHalfType(seasonId: string, halfType: Prisma.SeasonHalfWhereUniqueInput['halfType']): Promise<SeasonHalf | null>
  findPrevious(seasonHalfId: string): Promise<SeasonHalf | null>
  save(data: Prisma.SeasonHalfCreateInput): Promise<SeasonHalf>
  saveMany(data: Prisma.SeasonHalfCreateManyInput[]): Promise<Prisma.BatchPayload>
  updateOneById(id: Prisma.SeasonHalfWhereUniqueInput['id'], data: Prisma.SeasonHalfUpdateInput): Promise<SeasonHalf>
  deleteOneById(id: Prisma.SeasonHalfWhereUniqueInput['id']): Promise<SeasonHalf>
}
