import { CompetitionType, Prisma } from '@prisma/client'

export interface ICompetitionTypeRepository {
  save(data: Prisma.CompetitionTypeCreateInput): Promise<void>
  findAll(): Promise<CompetitionType[]>
  findOneById(id: Prisma.CompetitionTypeWhereUniqueInput['id']): Promise<CompetitionType | null>
  updateOneById(
    id: Prisma.CompetitionTypeWhereUniqueInput['id'],
    data: Prisma.CompetitionTypeUpdateInput
  ): Promise<void>
  deleteOneById(id: Prisma.CompetitionTypeWhereUniqueInput['id']): Promise<void>
}
