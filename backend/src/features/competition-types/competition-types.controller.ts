import { CompetitionCategory, CompetitionFormat, CompetitionName, CompetitionType } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { CompetitionTypeService } from '@/features/competition-types/competition-types.service'

export class CompetitionTypeController {
  private competitionTypeService: CompetitionTypeService

  constructor({ competitionTypeService }: { competitionTypeService: CompetitionTypeService }) {
    this.competitionTypeService = competitionTypeService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const { hierarchy, name, format, category } = req.body as {
      hierarchy: number
      name: CompetitionName
      format: CompetitionFormat
      category: CompetitionCategory
    }
    try {
      const newType = await this.competitionTypeService.createCompetitionType({
        hierarchy,
        name,
        format,
        category,
      })
      return reply.status(201).send({ data: newType })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while creating new competition type.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const competitionTypes = await this.competitionTypeService.findAllCompetitionTypes()
      return reply.status(200).send({ data: competitionTypes })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching competition types.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const competitionType = await this.competitionTypeService.findCompetitionType(id)
      return reply.status(200).send({ data: competitionType })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching competition type.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      await this.competitionTypeService.deleteCompetitionType(id)
      return reply.status(204).send()
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while deleting competition type.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async update(
    req: FastifyRequest<{ Params: { id: string }; Body: Partial<CompetitionType> }>,
    reply: FastifyReply
  ) {
    const { id } = req.params
    const data = req.body
    try {
      const updated = await this.competitionTypeService.updateCompetitionType(id, data)
      return reply.status(200).send({ data: updated })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while updating competition type.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }
}
