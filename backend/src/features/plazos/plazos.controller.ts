import { FastifyRequest, FastifyReply } from 'fastify'
import { PlazoService } from '@/features/plazos/plazos.service'
import { Response } from '@/features/core'
import {
  PlazoNotFoundError,
  DuplicatePlazoOrderError,
  InvalidPlazoScopeError,
} from '@/features/plazos/plazos.errors'

export class PlazoController {
  private plazoService: PlazoService

  constructor({ plazoService }: { plazoService: PlazoService }) {
    this.plazoService = plazoService
  }

  async getBySeasonHalf(
    req: FastifyRequest<{ Params: { seasonHalfId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const plazos = await this.plazoService.getBySeasonHalfId(req.params.seasonHalfId)
      return Response.success(reply, plazos, 'Plazos fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching plazos',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getBySeason(
    req: FastifyRequest<{ Params: { seasonId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const plazos = await this.plazoService.getBySeason(req.params.seasonId)
      return Response.success(reply, plazos, 'Plazos fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching plazos',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getById(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const plazo = await this.plazoService.getById(req.params.id)
      return Response.success(reply, plazo, 'Plazo fetched successfully')
    } catch (error: any) {
      if (error instanceof PlazoNotFoundError) {
        return Response.notFound(reply, 'Plazo', req.params.id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching plazo',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async toggleOpen(
    req: FastifyRequest<{
      Params: { id: string }
      Body: { isOpen: boolean }
    }>,
    reply: FastifyReply
  ) {
    try {
      const plazo = await this.plazoService.toggleOpen(req.params.id, req.body.isOpen)
      return Response.success(reply, plazo, 'Plazo toggled successfully')
    } catch (error: any) {
      if (error instanceof PlazoNotFoundError) {
        return Response.notFound(reply, 'Plazo', req.params.id)
      }
      return Response.error(
        reply,
        'TOGGLE_ERROR',
        'Error while toggling plazo',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async create(
    req: FastifyRequest<{
      Body: {
        seasonHalfId: string
        title: string
        deadline: string
        order: number
        isOpen?: boolean
        scopes: Array<{
          competitionId: string
          matchdayFrom?: number | null
          matchdayTo?: number | null
          knockoutRounds?: string[]
        }>
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const plazo = await this.plazoService.create(req.body)
      return Response.created(reply, plazo, 'Plazo created successfully')
    } catch (error: any) {
      if (error instanceof DuplicatePlazoOrderError) {
        return Response.error(reply, 'DUPLICATE_ORDER', error.message, 409)
      }
      if (error instanceof InvalidPlazoScopeError) {
        return Response.validation(reply, error.message, 'Validation error')
      }
      if (error.message?.includes('Invalid')) {
        return Response.validation(reply, error.message, 'Validation error')
      }
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating plazo',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async update(
    req: FastifyRequest<{
      Params: { id: string }
      Body: {
        title?: string
        deadline?: string
        order?: number
        scopes?: Array<{
          competitionId: string
          matchdayFrom?: number | null
          matchdayTo?: number | null
          knockoutRounds?: string[]
        }>
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const plazo = await this.plazoService.update(req.params.id, req.body)
      return Response.success(reply, plazo, 'Plazo updated successfully')
    } catch (error: any) {
      if (error instanceof PlazoNotFoundError) {
        return Response.notFound(reply, 'Plazo', req.params.id)
      }
      if (error instanceof DuplicatePlazoOrderError) {
        return Response.error(reply, 'DUPLICATE_ORDER', error.message, 409)
      }
      if (error instanceof InvalidPlazoScopeError) {
        return Response.validation(reply, error.message, 'Validation error')
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating plazo',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      await this.plazoService.delete(req.params.id)
      return Response.success(reply, null, 'Plazo deleted successfully')
    } catch (error: any) {
      if (error instanceof PlazoNotFoundError) {
        return Response.notFound(reply, 'Plazo', req.params.id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting plazo',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async reassignAll(
    req: FastifyRequest<{ Params: { seasonHalfId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.plazoService.reassignAll(req.params.seasonHalfId)
      return Response.success(reply, result, 'Plazos reassigned successfully')
    } catch (error) {
      return Response.error(
        reply,
        'REASSIGN_ERROR',
        'Error while reassigning plazos',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getOverdueReport(
    req: FastifyRequest<{ Params: { seasonId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const report = await this.plazoService.getOverdueReportByClub(req.params.seasonId)
      return Response.success(reply, report, 'Overdue report fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching overdue report',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
