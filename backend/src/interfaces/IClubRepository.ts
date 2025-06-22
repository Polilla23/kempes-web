import { Prisma, Club } from '@prisma/client'

export interface IClubRepository {
  findAll(): Promise<Club[] | null>
  findOneById(id: Prisma.ClubWhereUniqueInput['id']): Promise<Club | null>
  findOneByName(name: Prisma.ClubWhereUniqueInput['name']): Promise<Club | null>
  findOneByUserId(id: Prisma.ClubWhereUniqueInput['userId']): Promise<Club | null>
  save(data: Prisma.ClubCreateInput): Promise<Club>
  updateOneById(id: Prisma.ClubWhereUniqueInput['id'], data: Prisma.ClubUpdateInput): Promise<Club>
  deleteOneById(id: Prisma.ClubWhereUniqueInput['id']): Promise<Club>
}
