import { EventType, EventTypeName, Prisma } from "@prisma/client";

export interface IEventTypeRepository {
    findAll(): Promise<EventType[]>
    findOneById(id: string): Promise<EventType | null>
    findOneByName(name: EventTypeName): Promise<EventType | null>
    save(data: Prisma.EventTypeCreateInput): Promise<EventType>
    updateOneById(id: string, data: Prisma.EventTypeUpdateInput): Promise<EventType>
    deleteOneById(id: string): Promise<EventType>
}