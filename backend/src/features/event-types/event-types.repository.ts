import { EventType, EventTypeName, Prisma, PrismaClient } from '@prisma/client'
import { IEventTypeRepository } from '@/features/event-types/interface/IEventTypeRepository'

export class EventTypeRepository implements IEventTypeRepository {
    private prisma: PrismaClient

    constructor({ prisma }: { prisma: PrismaClient }) {
        this.prisma = prisma
    }

    async findAll(): Promise<EventType[]> {
        return await this.prisma.eventType.findMany({
            orderBy: { name: 'asc' },
        })
    }

    async findOneById(id: string): Promise<EventType | null> {
        return await this.prisma.eventType.findUnique({
            where: { id },
        })
    }

    async findOneByName(name: EventTypeName): Promise<EventType | null> {
        return await this.prisma.eventType.findUnique({
            where: { name },
        })
    }

    async save(data: Prisma.EventTypeCreateInput): Promise<EventType> {
        return await this.prisma.eventType.create({
            data,
        })
    }

    async updateOneById(id: string, data: Prisma.EventTypeUpdateInput): Promise<EventType> {
        return await this.prisma.eventType.update({
            where: { id },
            data,
        })
    }

    async deleteOneById(id: string): Promise<EventType> {
        return await this.prisma.eventType.delete({
            where: { id },
        })
    }
}