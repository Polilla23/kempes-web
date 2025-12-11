import { EventService } from '@/features/events/events.service'
import { FastifyRequest, FastifyReply } from 'fastify'
import { Event } from '@prisma/client'
import { validateUUID } from '@/features/utils/validation'

export class EventController {
  private eventService: EventService
  constructor({ eventService }: { eventService: EventService }) {
    this.eventService = eventService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const { typeId, playerId, matchId } = req.body as {
      typeId: string
      playerId: string
      matchId: string
    }
    try {
      const validatedData = {
        typeId: validateUUID(typeId),
        playerId: validateUUID(playerId),
        matchId: validateUUID(matchId)
      }
      const newEvent = await this.eventService.createEvent(validatedData)

      return reply.status(201).send({ data: newEvent })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while creating new event.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async findAll(req: FastifyRequest, reply: FastifyReply) {
    try {
      const events = await this.eventService.findAllEvents()

      return reply.status(200).send({ data: events })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching events.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validatedId = validateUUID(id)
      const event = await this.eventService.findEventById(validatedId)

      return reply.status(200).send({ data: event })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching event.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async findByMatchId(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validatedId = validateUUID(id)
      const events = await this.eventService.findEventsByMatchId(validatedId)

      return reply.status(200).send({ data: events })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching events by match ID.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async findByPlayerId(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validatedId = validateUUID(id)
      const events = await this.eventService.findEventsByPlayerId(validatedId)

      return reply.status(200).send({ data: events })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching events by player ID.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Event> }>, reply: FastifyReply) {
    const data = req.body
    const { id } = req.params
    try {
      const validatedId = validateUUID(id)
      const validatedData = {
        ...data,
        ...(data.typeId && { typeId: validateUUID(data.typeId) }),
        ...(data.playerId && { playerId: validateUUID(data.playerId) }),
        ...(data.matchId && { matchId: validateUUID(data.matchId) })
      }
      const updated = await this.eventService.updateEvent(validatedId, validatedData)

      return reply.status(200).send({ data: updated })
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        return reply.status(404).send({
          message: error.message,
        })
      }
      return reply.status(400).send({
        message: 'Error while updating the event.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validatedId = validateUUID(id)
      await this.eventService.deleteEvent(validatedId)

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        return reply.status(404).send({
          message: error.message,
        })
      }
      return reply.status(400).send({
        message: 'Error while deleting the event.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }
}
