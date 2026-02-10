import { Prisma, Club } from '@prisma/client'

export interface IClubRepository {
  findAll(): Promise<Club[] | null>
  findOneById(id: Prisma.ClubWhereUniqueInput['id']): Promise<Club | null>
  findOneByName(name: Prisma.ClubWhereUniqueInput['name']): Promise<Club | null>
  findOneByUserId(id: Prisma.ClubWhereUniqueInput['userId']): Promise<Club | null>
  save(data: Prisma.ClubCreateInput): Promise<Club>
  saveMany(data: Prisma.ClubCreateManyInput[]): Promise<Prisma.BatchPayload>
  updateOneById(id: Prisma.ClubWhereUniqueInput['id'], data: Prisma.ClubUpdateInput): Promise<Club>
  deleteOneById(id: Prisma.ClubWhereUniqueInput['id']): Promise<Club> // TODO: change to promise<void>
  getActivePlayers(clubId: string): Promise<{ id: string; name: string; lastName: string; overall: number | null }[]>
  findAvailableClubs(): Promise<{ id: string; name: string; logo: string | null }[]>
}
