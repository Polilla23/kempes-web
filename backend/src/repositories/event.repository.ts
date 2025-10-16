import { PrismaClient, Prisma, Event } from '@prisma/client'
import { IEventRepository } from '../interfaces/IEventRepository.js'

export class EventRepository implements IEventRepository {
  private prisma: PrismaClient
  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async save(data: Prisma.EventCreateInput): Promise<void> {
    await this.prisma.event.create({ data })
  }

  async findAll(): Promise<Event[]> {
    return this.prisma.event.findMany()
  }

  async findOneById(id: Prisma.EventWhereUniqueInput['id']): Promise<Event | null> {
    return this.prisma.event.findUnique({ where: { id } })
  }

  async updateOneById(id: Prisma.EventWhereUniqueInput['id'], data: Prisma.EventUpdateInput): Promise<void> {
    await this.prisma.event.update({ where: { id }, data })
  }

  async deleteOneById(id: Prisma.EventWhereUniqueInput['id']): Promise<void> {
    await this.prisma.event.delete({ where: { id } })
  }
}
