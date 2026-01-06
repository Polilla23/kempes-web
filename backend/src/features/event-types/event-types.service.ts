import { Prisma } from '@prisma/client'
import { IEventTypeRepository } from '@/features/event-types/interface/IEventTypeRepository'
import { EventTypeNotFoundError, EventTypeAlreadyExistsError } from '@/features/event-types/event-types.errors'

export class EventTypeService {
    private eventTypeRepository: IEventTypeRepository

    constructor({ eventTypeRepository }: { eventTypeRepository: IEventTypeRepository }) {
        this.eventTypeRepository = eventTypeRepository
    }

    async findAllEventTypes() {
        return await this.eventTypeRepository.findAll()
    }

    async findEventTypeById(id: string) {
        const eventType = await this.eventTypeRepository.findOneById(id)
        if (!eventType) {
            throw new EventTypeNotFoundError()
        }
        return eventType
    }

    async createEventType(data: Prisma.EventTypeCreateInput) {
        const existing = await this.eventTypeRepository.findOneByName(data.name)
        if (existing) {
            throw new EventTypeAlreadyExistsError()
        }
        return await this.eventTypeRepository.save(data)
    }

    async updateEventType(id: string, data: Prisma.EventTypeUpdateInput) {
        const eventType = await this.eventTypeRepository.findOneById(id)
        if (!eventType) {
            throw new EventTypeNotFoundError()
        }
        return await this.eventTypeRepository.updateOneById(id, data)
    }

    async deleteEventType(id: string) {
        const eventType = await this.eventTypeRepository.findOneById(id)
        if (!eventType) {
            throw new EventTypeNotFoundError()
        }
        return await this.eventTypeRepository.deleteOneById(id)
    }
}