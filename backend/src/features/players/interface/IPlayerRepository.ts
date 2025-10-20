import { Prisma, Player } from '@prisma/client'

export interface IPlayerRespository {
  findAll(): Promise<Player[] | null>
  findOneById(id: Prisma.PlayerWhereUniqueInput['id']): Promise<Player | null>
  updateOneById(id: Prisma.PlayerWhereUniqueInput['id'], data: Prisma.PlayerUpdateInput): Promise<Player>
  deleteOneById(id: Prisma.PlayerWhereUniqueInput['id']): Promise<Player>
  save(data: Prisma.PlayerCreateInput): Promise<Player>
  saveMany(data: Prisma.PlayerCreateInput[]): Promise<Prisma.BatchPayload>
}
