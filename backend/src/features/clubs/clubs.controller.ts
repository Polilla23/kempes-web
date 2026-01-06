import { Club } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { ClubService } from '@/features/clubs/clubs.service'
import { ClubMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { ClubDTO } from '@/types'

export class ClubController {
  private clubService: ClubService

  constructor({ clubService }: { clubService: ClubService }) {
    this.clubService = clubService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const { name, logo, userId, isActive } = req.body as {
      name: string
      logo: string
      userId?: string | null
      isActive?: boolean
    }

    try {
      const validatedData = {
        name: Validator.string(name, 1, 100),
        ...(logo && { logo: Validator.url(logo) }),
        ...(userId && { userId }),
        ...(isActive !== undefined && { isActive: Validator.boolean(isActive) }),
      }

      const newClub = await this.clubService.createClub(validatedData)
      const clubDTO = ClubMapper.toDTO(newClub)

      return Response.created(reply, clubDTO, 'Club created successfully')
    } catch (error: any) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Validation failed',
        'Error while creating new club'
      )
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const clubs = await this.clubService.findAllClubs()
      const clubDTOs = ClubMapper.toDTOArray(clubs ?? [])

      if (clubDTOs.length === 0) {
        return Response.success(reply, [], 'No clubs found')
      }

      return Response.success(reply, clubDTOs, 'Clubs fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching the clubs',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const club = await this.clubService.findClub(validId)
      const clubDTO = ClubMapper.toDTO(club)

      return Response.success(reply, clubDTO, 'Club fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Club', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching the club',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
  
  async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Club> }>, reply: FastifyReply) {
    const data = req.body
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const validatedData: Partial<Club> = {}
      
      if (data.name) validatedData.name = Validator.string(data.name, 1, 100)
      if (data.logo !== undefined) validatedData.logo = data.logo ? Validator.url(data.logo) : data.logo
      if (data.userId !== undefined) validatedData.userId = data.userId
      if (data.isActive !== undefined) validatedData.isActive = Validator.boolean(data.isActive)

      const updated = await this.clubService.updateClub(validId, validatedData)
      
      const updatedDTO = ClubMapper.toDTO(updated)

      return Response.success(reply, updatedDTO, 'Club updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Club', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating the club',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const deleted = await this.clubService.deleteClub(validId)
      const deletedDTO = ClubMapper.toDTO(deleted)
      return Response.success(reply, deletedDTO, 'Club deleted successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Club', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting the club',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
