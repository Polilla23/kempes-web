import { FastifyRequest, FastifyReply } from 'fastify'
import { EventTypeService } from '@/features/event-types/event-types.service'
import { EventTypeMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { EventTypeName } from '@prisma/client'

export class EventTypeController {
    private eventTypeService: EventTypeService

    constructor({ eventTypeService }: { eventTypeService: EventTypeService }) {
        this.eventTypeService = eventTypeService
    }

    async create(req: FastifyRequest, reply: FastifyReply) {
        const { name, displayName, icon, isActive } = req.body as {
            name: string
            displayName: string
            icon?: string
            isActive?: boolean
        }

        try {
            // Validate that name is a valid EventTypeName enum value
            if (!Object.values(EventTypeName).includes(name as EventTypeName)) {
                return Response.validation(
                    reply,
                    `Invalid event type name. Must be one of: ${Object.values(EventTypeName).join(', ')}`,
                    'Validation failed'
                )
            }

            const validatedData = {
                name: name as EventTypeName,
                displayName: Validator.string(displayName, 1, 100),
                ...(icon ? { icon: Validator.string(icon, 0, 50) } : {}),
                ...(isActive !== undefined && { isActive: Validator.boolean(isActive) }),
            }

            const newEventType = await this.eventTypeService.createEventType(validatedData)
            const eventTypeDTO = EventTypeMapper.toDTO(newEventType)

            return Response.created(reply, eventTypeDTO, 'Event type created successfully')
        } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                return Response.validation(
                    reply,
                    `An event type with the name "${name}" already exists. You can only have one event type per type.`,
                    'Event type already exists'
                )
            }
            return Response.validation(
                reply,
                error instanceof Error ? error.message : 'Validation failed',
                'Error while creating new event type'
            )
        }
    }

    async findAll(req: FastifyRequest, reply: FastifyReply) {
        try {
            const eventTypes = await this.eventTypeService.findAllEventTypes()
            const eventTypeDTOs = EventTypeMapper.toDTOArray(eventTypes ?? [])

            if (eventTypeDTOs.length === 0) {
                return Response.success(reply, [], 'No event types found')
            }

            return Response.success(reply, eventTypeDTOs, 'Event types retrieved successfully')
        } catch (error) {
            return Response.error(
                reply,
                'FETCH_ERROR',
                'Error while fetching event types',
                500,
                error instanceof Error ? error.message : error
            )
        }
    }

    async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = req.params

        try {
            const validId = Validator.uuid(id)
            const eventType = await this.eventTypeService.findEventTypeById(validId)
            const eventTypeDTO = EventTypeMapper.toDTO(eventType)

            return Response.success(reply, eventTypeDTO, 'Event type retrieved successfully')
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return Response.notFound(reply, 'Event type not found', id)
            }
            return Response.error(
                reply,
                'FETCH_ERROR',
                'Error while fetching event type',
                500,
                error instanceof Error ? error.message : error
            )
        }
    }

    async update(
        req: FastifyRequest<{ Params: { id: string }; Body: any }>,
        reply: FastifyReply
    ) {
        const { id } = req.params
        const { name, displayName, icon, isActive } = req.body as {
            name?: string
            displayName?: string
            icon?: string
            isActive?: boolean
        }

        try {
            const validId = Validator.uuid(id)
            const validatedData: any = {}

            if (name !== undefined) {
                // Validate that name is a valid EventTypeName enum value
                if (!Object.values(EventTypeName).includes(name as EventTypeName)) {
                    return Response.validation(
                        reply,
                        `Invalid event type name. Must be one of: ${Object.values(EventTypeName).join(', ')}`,
                        'Validation failed'
                    )
                }
                validatedData.name = name as EventTypeName
            }
            if (displayName !== undefined) validatedData.displayName = Validator.string(displayName, 1, 100)
            if (icon !== undefined) validatedData.icon = Validator.string(icon, 0, 50)
            if (isActive !== undefined) validatedData.isActive = Validator.boolean(isActive)

            const updated = await this.eventTypeService.updateEventType(validId, validatedData)
            const eventTypeDTO = EventTypeMapper.toDTO(updated)

            return Response.success(reply, eventTypeDTO, 'Event type updated successfully')
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return Response.notFound(reply, 'Event type not found', id)
            }
            return Response.error(
                reply,
                'UPDATE_ERROR',
                'Error while updating event type',
                500,
                error instanceof Error ? error.message : error
            )
        }
    }

    async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = req.params

        try {
            const validId = Validator.uuid(id)
            await this.eventTypeService.deleteEventType(validId)

            return Response.noContent(reply)
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return Response.notFound(reply, 'Event type not found', id)
            }
            return Response.error(
                reply,
                'DELETE_ERROR',
                'Error while deleting event type',
                500,
                error instanceof Error ? error.message : error
            )
        }
    }
}