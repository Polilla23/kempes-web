import { FastifyRequest, FastifyReply } from 'fastify'
import { KempesitaConfigService } from '@/features/kempesita-config/kempesita-config.service'
import { Response } from '@/features/core'

export class KempesitaConfigController {
  private kempesitaConfigService: KempesitaConfigService

  constructor({ kempesitaConfigService }: { kempesitaConfigService: KempesitaConfigService }) {
    this.kempesitaConfigService = kempesitaConfigService
  }

  async getActive(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const config = await this.kempesitaConfigService.getActiveConfig()
      return Response.success(reply, config, 'Kempesita config fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching kempesita config',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async upsert(req: FastifyRequest, reply: FastifyReply) {
    const { maxBirthYear } = req.body as { maxBirthYear: number }

    try {
      const config = await this.kempesitaConfigService.upsertConfig(maxBirthYear)
      return Response.success(reply, config, 'Kempesita config saved successfully')
    } catch (error) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Validation failed',
        'Error while saving kempesita config'
      )
    }
  }
}
