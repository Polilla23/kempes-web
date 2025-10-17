import { Event, Prisma } from '@prisma/client'
import { EventNotFoundError } from '../errors/event.errors'
import { EventRepository } from '../repositories/event.repository'
import { CreateEvent } from 'utils/types'

export class EventService {
  private eventRepository: EventRepository

  constructor({ eventRepository }: { eventRepository: EventRepository }) {
    this.eventRepository = eventRepository
  }

  async createEvent({ typeId, playerId, matchId }: CreateEvent): Promise<void> {
    await this.eventRepository.save({
      type: { connect: { id: typeId } },
      player: { connect: { id: playerId } },
      match: { connect: { id: matchId } },
    })
  }

  async findAllEvents(): Promise<Event[]> {
    return await this.eventRepository.findAll()
  }

  async findEventById(id: Prisma.EventWhereUniqueInput['id']): Promise<Event | null> {
    const event = await this.eventRepository.findOneById(id)

    if (!event) {
      throw new EventNotFoundError()
    }
    return event
  }

  async findEventsByMatchId(id: string): Promise<Event[] | null> {
    const events = await this.eventRepository.findManyByMatchId(id)

    if (!events) {
      throw new EventNotFoundError()
    }

    return events
  }

  async findEventsByPlayerId(id: string): Promise<Event[] | null> {
    const events = await this.eventRepository.findManyByPlayerId(id)

    if (!events) {
      throw new EventNotFoundError()
    }

    return events
  }

  async updateEvent(id: Prisma.EventWhereUniqueInput['id'], data: Prisma.EventUpdateInput): Promise<void> {
    const event = await this.eventRepository.findOneById(id)

    if (!event) {
      throw new EventNotFoundError()
    }

    await this.eventRepository.updateOneById(id, data)
  }

  async deleteEvent(id: Prisma.EventWhereUniqueInput['id']): Promise<void> {
    const event = await this.eventRepository.findOneById(id)

    if (!event) {
      throw new EventNotFoundError()
    }

    await this.eventRepository.deleteOneById(id)
  }
}
