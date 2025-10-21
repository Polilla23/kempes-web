import { Prisma, Event } from '@prisma/client'

export interface IEventRepository {
  save(data: Prisma.EventCreateInput): Promise<void>
  findAll(): Promise<Event[]>
  findOneById(id: Prisma.EventWhereUniqueInput['id']): Promise<Event | null>
  updateOneById(id: Prisma.EventWhereUniqueInput['id'], data: Prisma.EventUpdateInput): Promise<void>
  deleteOneById(id: Prisma.EventWhereUniqueInput['id']): Promise<void>
  findManyByMatchId(matchId: string): Promise<Event[] | null>
  findManyByPlayerId(playerId: string): Promise<Event[] | null>
}
