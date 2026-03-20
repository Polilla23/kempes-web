import { Club } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { ClubService } from '@/features/clubs/clubs.service'
import { ClubMapper, Response, ValidationError } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { ClubDTO } from '@/types'

export class ClubController {
  private clubService: ClubService

  constructor({ clubService }: { clubService: ClubService }) {
    this.clubService = clubService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const fields: Record<string, string> = {}
    let logoFile: { buffer: Buffer; filename: string; mimetype: string } | undefined

    for await (const part of (req as any).parts()) {
      if (part.type === 'file' && part.fieldname === 'logo') {
        const buffer = await part.toBuffer()
        logoFile = { buffer, filename: part.filename, mimetype: part.mimetype }
      } else if (part.type === 'field') {
        fields[part.fieldname] = part.value as string
      }
    }

    const { name, userId, isActive } = fields

    try {
      const validatedData = {
        name: Validator.string(name, 1, 100),
        ...(userId && { userId }),
        ...(isActive !== undefined && { isActive: Validator.boolean(isActive) }),
      }

      const newClub = await this.clubService.createClub({ ...validatedData, logoFile })
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

  async findAvailable(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const clubs = await this.clubService.findAvailableClubs()

      if (clubs.length === 0) {
        return Response.success(reply, [], 'No available clubs found')
      }

      return Response.success(reply, clubs, 'Available clubs fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching available clubs',
        500,
        error instanceof Error ? error.message : error
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
  
  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    const fields: Record<string, string> = {}
    let logoFile: { buffer: Buffer; filename: string; mimetype: string } | undefined

    for await (const part of (req as any).parts()) {
      if (part.type === 'file' && part.fieldname === 'logo') {
        const buffer = await part.toBuffer()
        logoFile = { buffer, filename: part.filename, mimetype: part.mimetype }
      } else if (part.type === 'field') {
        fields[part.fieldname] = part.value as string
      }
    }

    try {
      const validId = Validator.uuid(id)
      const validatedData: Record<string, any> = {}

      if (fields.name) validatedData.name = Validator.string(fields.name, 1, 100)
      if (fields.userId !== undefined) validatedData.userId = fields.userId
      if (fields.isActive !== undefined) validatedData.isActive = Validator.boolean(fields.isActive)
      if (logoFile) validatedData.logoFile = logoFile

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

  async getClubPlayers(req: FastifyRequest<{ Params: { clubId: string } }>, reply: FastifyReply) {
    const { clubId } = req.params

    try {
      const validId = Validator.uuid(clubId)
      const players = await this.clubService.getClubPlayers(validId)

      return Response.success(reply, players, 'Club players fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Club', clubId)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching club players',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getTitles(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const titles = await this.clubService.getClubTitles(validId)
      return Response.success(reply, titles, 'Club titles fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Club', id)
      }
      return Response.error(reply, 'FETCH_ERROR', 'Error while fetching club titles', 500, error instanceof Error ? error.message : error)
    }
  }

  async getSquad(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const squad = await this.clubService.getClubSquad(validId)
      return Response.success(reply, squad, 'Club squad fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Club', id)
      }
      return Response.error(reply, 'FETCH_ERROR', 'Error while fetching club squad', 500, error instanceof Error ? error.message : error)
    }
  }

  async getHistory(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const history = await this.clubService.getClubHistory(validId)
      return Response.success(reply, history, 'Club history fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Club', id)
      }
      return Response.error(reply, 'FETCH_ERROR', 'Error while fetching club history', 500, error instanceof Error ? error.message : error)
    }
  }

  async getFinances(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const finances = await this.clubService.getClubFinances(validId)
      return Response.success(reply, finances, 'Club finances fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Club', id)
      }
      return Response.error(reply, 'FETCH_ERROR', 'Error while fetching club finances', 500, error instanceof Error ? error.message : error)
    }
  }

  async uploadCSVFile(req: FastifyRequest, reply: FastifyReply) {
    const data = await (req as any).file()

    if (!data) {
      throw new ValidationError('File is required', { field: 'file' })
    }

    const csvContent = await data.toBuffer()
    await this.clubService.processCSVFile(csvContent.toString('utf-8'))

    return Response.success(
      reply,
      { message: 'Clubs processed and saved successfully' },
      'CSV processed successfully',
    )
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
