import { FastifyRequest, FastifyReply } from 'fastify'
import { CompetitionTypeService } from '@/features/competition-types/competition-types.service'
import { CompetitionTypeMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { CompetitionCategory, CompetitionFormat, CompetitionName } from '@prisma/client'

export class CompetitionTypeController {
  private competitionTypeService: CompetitionTypeService

  constructor({ competitionTypeService }: { competitionTypeService: CompetitionTypeService }) {
    this.competitionTypeService = competitionTypeService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const { hierarchy, name, format, category } = req.body as {
      hierarchy: number
      name: string
      format: string
      category: string
    }

    try {
      // Validate enum values
      if (!Object.values(CompetitionName).includes(name as CompetitionName)) {
        throw new Error(`Invalid competition name: ${name}`)
      }
      if (!Object.values(CompetitionFormat).includes(format as CompetitionFormat)) {
        throw new Error(`Invalid competition format: ${format}`)
      }
      if (!Object.values(CompetitionCategory).includes(category as CompetitionCategory)) {
        throw new Error(`Invalid competition category: ${category}`)
      }

      const validatedData = {
        hierarchy: Validator.number(hierarchy, 1),
        name: name as CompetitionName,
        format: format as CompetitionFormat,
        category: category as CompetitionCategory,
      }

      const newType = await this.competitionTypeService.createCompetitionType(validatedData)
      const competitionTypeDTO = CompetitionTypeMapper.toDTO(newType)

      return Response.created(reply, competitionTypeDTO, 'Competition type created successfully')
    } catch (error: unknown) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Validation failed',
        'Error while creating new competition type'
      )
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const competitionTypes = await this.competitionTypeService.findAllCompetitionTypes()
      const competitionTypeDTOs = CompetitionTypeMapper.toDTOArray(competitionTypes ?? [])

      if (competitionTypeDTOs.length === 0) {
        return Response.success(reply, [], 'No competition types found')
      }

      return Response.success(reply, competitionTypeDTOs, 'Competition types fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching competition types',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const competitionType = await this.competitionTypeService.findCompetitionType(validId)
      const competitionTypeDTO = CompetitionTypeMapper.toDTO(competitionType)

      return Response.success(reply, competitionTypeDTO, 'Competition type fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition type', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching competition type',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async update(
    req: FastifyRequest<{ Params: { id: string }; Body: Partial<{
      hierarchy: number
      name: string
      format: string
      category: string
    }> }>,
    reply: FastifyReply
  ) {
    const { id } = req.params
    const { hierarchy, name, format, category } = req.body

    try {
      const validId = Validator.uuid(id)
      const validatedData: Partial<{
        hierarchy: number
        name: CompetitionName
        format: CompetitionFormat
        category: CompetitionCategory
      }> = {}

      if (hierarchy !== undefined) {
        validatedData.hierarchy = Validator.number(hierarchy, 1)
      }
      if (name !== undefined) {
        if (!Object.values(CompetitionName).includes(name as CompetitionName)) {
          throw new Error(`Invalid competition name: ${name}`)
        }
        validatedData.name = name as CompetitionName
      }
      if (format !== undefined) {
        if (!Object.values(CompetitionFormat).includes(format as CompetitionFormat)) {
          throw new Error(`Invalid competition format: ${format}`)
        }
        validatedData.format = format as CompetitionFormat
      }
      if (category !== undefined) {
        if (!Object.values(CompetitionCategory).includes(category as CompetitionCategory)) {
          throw new Error(`Invalid competition category: ${category}`)
        }
        validatedData.category = category as CompetitionCategory
      }

      const updated = await this.competitionTypeService.updateCompetitionType(validId, validatedData)
      const competitionTypeDTO = CompetitionTypeMapper.toDTO(updated)

      return Response.success(reply, competitionTypeDTO, 'Competition type updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition type', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating competition type',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      await this.competitionTypeService.deleteCompetitionType(validId)

      return Response.noContent(reply)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition type', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting competition type',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}