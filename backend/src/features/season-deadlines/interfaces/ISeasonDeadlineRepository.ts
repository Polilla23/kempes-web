import { Prisma, SeasonDeadline } from '@prisma/client'

export interface ISeasonDeadlineRepository {
  findBySeasonId(seasonId: string): Promise<SeasonDeadline[]>
  findOneById(id: Prisma.SeasonDeadlineWhereUniqueInput['id']): Promise<SeasonDeadline | null>
  save(data: Prisma.SeasonDeadlineUncheckedCreateInput): Promise<SeasonDeadline>
  saveMany(data: Prisma.SeasonDeadlineCreateManyInput[]): Promise<Prisma.BatchPayload>
  updateOneById(id: Prisma.SeasonDeadlineWhereUniqueInput['id'], data: Prisma.SeasonDeadlineUpdateInput): Promise<SeasonDeadline>
  deleteOneById(id: Prisma.SeasonDeadlineWhereUniqueInput['id']): Promise<SeasonDeadline>
}
