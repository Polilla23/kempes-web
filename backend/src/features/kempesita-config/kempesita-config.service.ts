import { PrismaClient } from '@prisma/client'
import { IKempesitaConfigRepository } from '@/features/kempesita-config/interfaces/IKempesitaConfigRepository'
import { KempesitaConfigErrors } from '@/features/kempesita-config/kempesita-config.errors'

export class KempesitaConfigService {
  private kempesitaConfigRepository: IKempesitaConfigRepository
  private prisma: PrismaClient

  constructor({
    kempesitaConfigRepository,
    prisma,
  }: {
    kempesitaConfigRepository: IKempesitaConfigRepository
    prisma: PrismaClient
  }) {
    this.kempesitaConfigRepository = kempesitaConfigRepository
    this.prisma = prisma
  }

  async getActiveConfig() {
    return await this.kempesitaConfigRepository.findActive()
  }

  async upsertConfig(maxBirthYear: number) {
    if (!Number.isInteger(maxBirthYear) || maxBirthYear < 1900 || maxBirthYear > 2100) {
      throw new KempesitaConfigErrors.Validation('maxBirthYear must be a 4-digit year between 1900 and 2100', {
        field: 'maxBirthYear',
        value: maxBirthYear,
      })
    }

    const existingConfig = await this.kempesitaConfigRepository.findActive()

    let config
    if (existingConfig) {
      config = await this.kempesitaConfigRepository.updateOneById(existingConfig.id, { maxBirthYear })
    } else {
      config = await this.kempesitaConfigRepository.save({ maxBirthYear })
    }

    // Actualizar jugadores que son kempesita pero ya no deberían serlo.
    // Solo toca los que tienen isKempesita = true y nacieron antes del nuevo año.
    // Como el año siempre sube, los que ya son false nunca vuelven a ser true.
    // Usamos el 1 de enero del año siguiente para cubrir offsets de zona horaria
    // (ej: 2007-01-01 en Argentina se guarda como 2007-01-01T03:00:00Z en UTC)
    const cutoffDate = new Date(`${maxBirthYear + 1}-01-01`)
    const updateResult = await this.prisma.player.updateMany({
      where: {
        isKempesita: true,
        birthdate: { lt: cutoffDate },
      },
      data: { isKempesita: false },
    })
    console.log(`[KempesitaConfig] Updated ${updateResult.count} players to isKempesita=false (cutoff: ${cutoffDate.toISOString()})`)

    return config
  }
}
