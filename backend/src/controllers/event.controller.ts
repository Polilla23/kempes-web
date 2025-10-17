import { EventService } from 'services/event.service'
import { FastifyRequest, FastifyReply } from 'fastify'
import { Event } from '@prisma/client'

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
      await this.eventService.createEvent({ typeId, playerId, matchId })

      return reply.status(200).send({ message: 'Event created successfully.' })
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

      return reply.status(200).send({ events })
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
      const event = await this.eventService.findEventById(id)

      return reply.status(200).send(event)
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
      const events = await this.eventService.findEventsByMatchId(id)

      return reply.status(200).send({ events })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching events by match ID.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Event> }>, reply: FastifyReply) {
    const data = req.body
    const { id } = req.params
    try {
      await this.eventService.updateEvent(id, data)

      return reply.status(200).send({ message: 'Event updated successfully.' })
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
      await this.eventService.deleteEvent(id)

      return reply.status(204).send({ message: 'Event deleted successfully.' })
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
}
