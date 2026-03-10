import { CompetitionType, CompetitionCategory, CompetitionName, Prisma } from '@prisma/client'

export interface ICompetitionTypeRepository {
  save(data: Prisma.CompetitionTypeCreateInput): Promise<CompetitionType>
  findAll(): Promise<CompetitionType[]>
  findOneById(id: Prisma.CompetitionTypeWhereUniqueInput['id']): Promise<CompetitionType | null>
  findOneByNameAndCategory(name: CompetitionName, category: CompetitionCategory): Promise<CompetitionType | null>
  updateOneById(
    id: Prisma.CompetitionTypeWhereUniqueInput['id'],
    data: Prisma.CompetitionTypeUpdateInput
  ): Promise<CompetitionType>
  deleteOneById(id: Prisma.CompetitionTypeWhereUniqueInput['id']): Promise<CompetitionType>
}
