import { PrismaClient, Prisma } from '@prisma/client'
import { IEventRepository } from '@/features/events/interface/IEventRepository'
import { EventWithRelations } from '@/types'

export class EventRepository implements IEventRepository {
  private prisma: PrismaClient
  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async save(data: Prisma.EventCreateInput): Promise<EventWithRelations> {
    return await this.prisma.event.create({ 
      data,
      include: {
        player: true,
        type: true,
        match: {
          include: {
            homeClub: true,
            awayClub: true
          }
        }
      }
    })
  }

  async findAll(): Promise<EventWithRelations[]> {
    return this.prisma.event.findMany({
      include: {
        player: true,
        type: true,
        match: {
          include: {
            homeClub: true,
            awayClub: true
          }
        }
      }
    })
  }

  async findOneById(id: Prisma.EventWhereUniqueInput['id']): Promise<EventWithRelations | null> {
    return this.prisma.event.findUnique({ 
      where: { id },
      include: {
        player: true,
        type: true,
        match: {
          include: {
            homeClub: true,
            awayClub: true
          }
        }
      }
    })
  }

  async findManyByMatchId(id: string): Promise<EventWithRelations[] | null> {
    return this.prisma.event.findMany({ 
      where: { matchId: id },
      include: {
        player: true,
        type: true,
        match: {
          include: {
            homeClub: true,
            awayClub: true
          }
        }
      }
    })
  }

  async findManyByPlayerId(id: string): Promise<EventWithRelations[] | null> {
    return this.prisma.event.findMany({ 
      where: { playerId: id },
      include: {
        player: true,
        type: true,
        match: {
          include: {
            homeClub: true,
            awayClub: true
          }
        }
      }
    })
  }

  async updateOneById(id: Prisma.EventWhereUniqueInput['id'], data: Prisma.EventUpdateInput): Promise<EventWithRelations> {
    return await this.prisma.event.update({ 
      where: { id }, 
      data,
      include: {
        player: true,
        type: true,
        match: {
          include: {
            homeClub: true,
            awayClub: true
          }
        }
      }
    })
  }

  async deleteOneById(id: Prisma.EventWhereUniqueInput['id']): Promise<void> {
    await this.prisma.event.delete({ where: { id } })
  }
}
