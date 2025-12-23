import { Prisma } from '@prisma/client'
import { EventWithRelations } from '@/types'

export interface IEventRepository {
  save(data: Prisma.EventCreateInput): Promise<EventWithRelations>
  findAll(): Promise<EventWithRelations[]>
  findOneById(id: Prisma.EventWhereUniqueInput['id']): Promise<EventWithRelations | null>
  updateOneById(id: Prisma.EventWhereUniqueInput['id'], data: Prisma.EventUpdateInput): Promise<EventWithRelations>
  deleteOneById(id: Prisma.EventWhereUniqueInput['id']): Promise<void>
  findManyByMatchId(matchId: string): Promise<EventWithRelations[] | null>
  findManyByPlayerId(playerId: string): Promise<EventWithRelations[] | null>
}
