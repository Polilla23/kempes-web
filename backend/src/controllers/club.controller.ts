import { Club } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { ClubService } from 'services/club.service'

export class ClubController {
  private clubService: ClubService

  constructor({ clubService }: { clubService: ClubService }) {
    this.clubService = clubService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const { name, logo, userId, isActive } = req.body as { name: string; logo: string; userId?: string | null; isActive?: boolean}
    try {
      await this.clubService.createClub({ name, logo, userId, isActive })

      return reply.status(200).send({ message: 'Club created succesfully.' })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while creating new club.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const clubs = await this.clubService.findAllClubs()

      return reply.status(200).send({clubs})
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching the clubs.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }
  async findOne(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string }
    try {
      const club = await this.clubService.findClub(id)

      return reply.status(200).send(club)
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching the club.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }
  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      await this.clubService.deleteClub(id)

      return reply.status(200).send({ message: 'Club deleted successfully.' })
    } catch (error) {
      if (error instanceof Error && error.message === 'Club not found') {
        return reply.status(404).send({
          message: error.message,
        })
      }
      return reply.status(400).send({
        message: 'Error while deleting the club.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }
  async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Club> }>, reply: FastifyReply) {
    const data = req.body
    const { id } = req.params

    try {
      await this.clubService.updateClub(id, data)

      return reply.status(200).send({ message: 'Club updated successfully.' })
    } catch (error) {
      if (error instanceof Error && error.message === 'Club not found') {
        return reply.status(404).send({
          message: error.message,
        })
      }
      return reply.status(400).send({
        message: 'Error while updating the club.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }
}
