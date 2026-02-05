import { SeasonHalfType, Prisma } from '@prisma/client'
import { SeasonHalfRepository } from '@/features/season-halves/season-halves.repository'
import { SeasonRepository } from '@/features/seasons/seasons.repository'
import {
  SeasonHalfNotFoundError,
  SeasonHalfAlreadyExistsError,
  NoActiveSeasonHalfError,
  InvalidSeasonHalfTransitionError,
} from '@/features/season-halves/season-halves.errors'

export class SeasonHalfService {
  private seasonHalfRepository: SeasonHalfRepository
  private seasonRepository: SeasonRepository

  constructor({
    seasonHalfRepository,
    seasonRepository,
  }: {
    seasonHalfRepository: SeasonHalfRepository
    seasonRepository: SeasonRepository
  }) {
    this.seasonHalfRepository = seasonHalfRepository
    this.seasonRepository = seasonRepository
  }

  async findAllSeasonHalves() {
    return await this.seasonHalfRepository.findAll()
  }

  async findSeasonHalf(id: string) {
    const seasonHalfFound = await this.seasonHalfRepository.findOneById(id)

    if (!seasonHalfFound) {
      throw new SeasonHalfNotFoundError()
    }
    return seasonHalfFound
  }

  async findBySeasonId(seasonId: string) {
    return await this.seasonHalfRepository.findBySeasonId(seasonId)
  }

  async findActiveSeasonHalf() {
    const activeHalf = await this.seasonHalfRepository.findActive()
    if (!activeHalf) {
      throw new NoActiveSeasonHalfError()
    }
    return activeHalf
  }

  // Crear las dos medias temporadas para una temporada
  async createSeasonHalves(seasonId: string) {
    // Verificar que la temporada existe
    const season = await this.seasonRepository.findOneById(seasonId)
    if (!season) {
      throw new Error('Season not found')
    }

    // Verificar que no existan ya medias temporadas para esta temporada
    const existingHalves = await this.seasonHalfRepository.findBySeasonId(seasonId)
    if (existingHalves && existingHalves.length > 0) {
      throw new SeasonHalfAlreadyExistsError()
    }

    // Crear ambas medias temporadas
    const halves: Prisma.SeasonHalfCreateManyInput[] = [
      {
        seasonId,
        halfType: SeasonHalfType.FIRST_HALF,
        isActive: false,
      },
      {
        seasonId,
        halfType: SeasonHalfType.SECOND_HALF,
        isActive: false,
      },
    ]

    await this.seasonHalfRepository.saveMany(halves)
    return await this.seasonHalfRepository.findBySeasonId(seasonId)
  }

  // Activar una media temporada específica
  async activateSeasonHalf(id: string) {
    const seasonHalf = await this.seasonHalfRepository.findOneById(id)
    if (!seasonHalf) {
      throw new SeasonHalfNotFoundError()
    }

    // Desactivar todas las medias temporadas activas
    await this.seasonHalfRepository.deactivateAll()

    // Activar la media temporada seleccionada
    return await this.seasonHalfRepository.updateOneById(id, { isActive: true })
  }

  // Avanzar a la siguiente media temporada
  async advanceToNextHalf() {
    const currentHalf = await this.seasonHalfRepository.findActive()
    if (!currentHalf) {
      throw new NoActiveSeasonHalfError()
    }

    // Si estamos en la primera mitad, avanzar a la segunda
    if (currentHalf.halfType === SeasonHalfType.FIRST_HALF) {
      const secondHalf = await this.seasonHalfRepository.findBySeasonAndHalfType(
        currentHalf.seasonId,
        SeasonHalfType.SECOND_HALF
      )

      if (!secondHalf) {
        throw new InvalidSeasonHalfTransitionError('Second half not found for this season')
      }

      await this.seasonHalfRepository.deactivateAll()
      return await this.seasonHalfRepository.updateOneById(secondHalf.id, { isActive: true })
    }

    // Si estamos en la segunda mitad, necesitamos avanzar a la siguiente temporada
    throw new InvalidSeasonHalfTransitionError(
      'Cannot advance from second half. Create a new season first.'
    )
  }

  async updateSeasonHalf(id: string, data: Prisma.SeasonHalfUpdateInput) {
    const seasonHalfFound = await this.seasonHalfRepository.findOneById(id)

    if (!seasonHalfFound) {
      throw new SeasonHalfNotFoundError()
    }

    return await this.seasonHalfRepository.updateOneById(id, data)
  }

  async deleteSeasonHalf(id: string) {
    const seasonHalfFound = await this.seasonHalfRepository.findOneById(id)

    if (!seasonHalfFound) {
      throw new SeasonHalfNotFoundError()
    }

    return await this.seasonHalfRepository.deleteOneById(id)
  }
}
