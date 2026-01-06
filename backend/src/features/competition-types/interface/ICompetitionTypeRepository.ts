import { CompetitionType, Prisma } from '@prisma/client'

export interface ICompetitionTypeRepository {
  save(data: Prisma.CompetitionTypeCreateInput): Promise<CompetitionType>
  findAll(): Promise<CompetitionType[]>
  findOneById(id: Prisma.CompetitionTypeWhereUniqueInput['id']): Promise<CompetitionType | null>
  findOneByName(name: Prisma.CompetitionTypeWhereUniqueInput['name']): Promise<CompetitionType | null>
  updateOneById(
    id: Prisma.CompetitionTypeWhereUniqueInput['id'],
    data: Prisma.CompetitionTypeUpdateInput
  ): Promise<CompetitionType>
  deleteOneById(id: Prisma.CompetitionTypeWhereUniqueInput['id']): Promise<CompetitionType>
}
