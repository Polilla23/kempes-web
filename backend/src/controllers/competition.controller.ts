import { CompetitionService } from 'services/competition.service'
import { FastifyRequest, FastifyReply } from 'fastify'
import { KempesCupRules, LeaguesRules } from 'utils/types'

export class CompetitionController {
  private competitionService: CompetitionService

  constructor({ competitionService }: { competitionService: CompetitionService }) {
    this.competitionService = competitionService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const config = req.body as LeaguesRules
    try {
      await this.competitionService.createCompetition(config)
      return reply.status(200).send({ message: 'Competition  created successfully.' })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while creating new competition .',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const competitions = await this.competitionService.findAllCompetitions()
      return reply.status(200).send(competitions)
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching competitions .',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const competition = await this.competitionService.findCompetition(id)
      return reply.status(200).send(competition)
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching competition .',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      await this.competitionService.deleteCompetition(id)
      return reply.status(200).send({ message: 'Competition  deleted successfully.' })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while deleting competition .',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async update(
    req: FastifyRequest<{ Params: { id: string }; Body: Partial<LeaguesRules | KempesCupRules> }>,
    reply: FastifyReply
  ) {
    const { id } = req.params
    const data = req.body
    try {
      await this.competitionService.updateCompetition(id, data)
      return reply.status(200).send({ message: 'Competition  updated successfully.' })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while updating competition .',
        error: error instanceof Error ? error.message : error,
      })
    }
  }
}
