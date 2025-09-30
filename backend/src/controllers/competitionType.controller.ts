import { CompetitionTypeService } from 'services/competitionType.service'
import { FastifyRequest, FastifyReply } from 'fastify'
import { CompetitionCategory, CompetitionFormat, CompetitionName, CompetitionType } from '@prisma/client'

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
      await this.competitionTypeService.createCompetitionType({ hierarchy, name, format, category })
      return reply.status(200).send({ message: 'Competition type created successfully.' })
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
      return reply.status(200).send(competitionTypes)
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
      return reply.status(200).send(competitionType)
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
      return reply.status(200).send({ message: 'Competition type deleted successfully.' })
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
      await this.competitionTypeService.updateCompetitionType(id, data)
      return reply.status(200).send({ message: 'Competition type updated successfully.' })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while updating competition type.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }
}
