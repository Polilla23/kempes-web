import { Event, Prisma } from '@prisma/client'
import { EventNotFoundError } from '@/features/events/events.errors'
import { EventRepository } from '@/features/events/events.repository'
import { CreateEvent, EventWithRelations } from '@/types'

export class EventService {
  private eventRepository: EventRepository

  constructor({ eventRepository }: { eventRepository: EventRepository }) {
    this.eventRepository = eventRepository
  }

  async createEvent({ typeId, playerId, matchId }: CreateEvent): Promise<EventWithRelations> {
    const createdEvent = await this.eventRepository.save({
      type: { connect: { id: typeId } },
      player: { connect: { id: playerId } },
      match: { connect: { id: matchId } },
    })
    return createdEvent
  }

  async findAllEvents(): Promise<EventWithRelations[]> {
    return await this.eventRepository.findAll()
  }

  async findEventById(id: Prisma.EventWhereUniqueInput['id']): Promise<EventWithRelations | null> {
    const event = await this.eventRepository.findOneById(id)

    if (!event) {
      throw new EventNotFoundError()
    }
    return event
  }

  async findEventsByMatchId(id: string): Promise<EventWithRelations[] | null> {
    const events = await this.eventRepository.findManyByMatchId(id)

    if (!events) {
      throw new EventNotFoundError()
    }

    return events
  }

  async findEventsByPlayerId(id: string): Promise<EventWithRelations[] | null> {
    const events = await this.eventRepository.findManyByPlayerId(id)

    if (!events) {
      throw new EventNotFoundError()
    }

    return events
  }

  async updateEvent(id: Prisma.EventWhereUniqueInput['id'], data: Prisma.EventUpdateInput): Promise<EventWithRelations> {
    const event = await this.eventRepository.findOneById(id)

    if (!event) {
      throw new EventNotFoundError()
    }

    const updatedEvent = await this.eventRepository.updateOneById(id, data)
    return updatedEvent
  }

  async deleteEvent(id: Prisma.EventWhereUniqueInput['id']): Promise<void> {
    const event = await this.eventRepository.findOneById(id)

    if (!event) {
      throw new EventNotFoundError()
    }

    await this.eventRepository.deleteOneById(id)
  }
}
