import { Event } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { EventService } from '@/features/events/events.service'
import { EventMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { EventDTO } from '@/types'

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
        typeId: Validator.uuid(typeId),
        playerId: Validator.uuid(playerId),
        matchId: Validator.uuid(matchId),
      }
      const newEvent = await this.eventService.createEvent(validatedData)
      const eventDTO = EventMapper.toDTO(newEvent)

      return Response.created(reply, eventDTO, 'Event created successfully')
    } catch (error: any) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Validation failed',
        'Error while creating new event'
      )
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const events = await this.eventService.findAllEvents()
      const eventDTOs = EventMapper.toDTOArray(events ?? [])

      if (eventDTOs.length === 0) {
        return Response.success(reply, [], 'No events found')
      }

      return Response.success(reply, eventDTOs, 'Events fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching the events',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validId = Validator.uuid(id)
      const event = await this.eventService.findEventById(validId)

      if (!event) {
        return Response.notFound(reply, 'Event', id)
      }

      const eventDTO = EventMapper.toDTO(event)
      return Response.success(reply, eventDTO, 'Event fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Event', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching the event',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findByMatchId(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validId = Validator.uuid(id)
      const events = await this.eventService.findEventsByMatchId(validId)
      const eventDTOs = EventMapper.toDTOArray(events ?? [])

      return Response.success(reply, eventDTOs, 'Events by match ID fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching events by match ID',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findByPlayerId(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validId = Validator.uuid(id)
      const events = await this.eventService.findEventsByPlayerId(validId)
      const eventDTOs = EventMapper.toDTOArray(events ?? [])

      return Response.success(reply, eventDTOs, 'Events by player ID fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching events by player ID',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Event> }>, reply: FastifyReply) {
    const data = req.body
    const { id } = req.params
    try {
      const validId = Validator.uuid(id)
      const validatedData = {
        ...data,
        ...(data.typeId && { typeId: Validator.uuid(data.typeId) }),
        ...(data.playerId && { playerId: Validator.uuid(data.playerId) }),
        ...(data.matchId && { matchId: Validator.uuid(data.matchId) }),
      }
      const updated = await this.eventService.updateEvent(validId, validatedData)
      const updatedDTO = EventMapper.toDTO(updated)

      return Response.success(reply, updatedDTO, 'Event updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Event', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating the event',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validId = Validator.uuid(id)
      await this.eventService.deleteEvent(validId)
      return Response.noContent(reply)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Event', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting the event',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
