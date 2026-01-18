import { Prisma, PrismaClient, MatchStatus } from '@prisma/client'
import { ISeasonRepository } from '@/features/seasons/interface/ISeasonRepository'
import { 
  SeasonNotFoundError, 
  SeasonAlreadyExistsError,
  ActiveSeasonAlreadyExistsError 
} from '@/features/seasons/seasons.errors'
import { StandingsService } from '@/features/seasons/standings.service'

export class SeasonService {
  private seasonRepository: ISeasonRepository
  private standingsService: StandingsService

  constructor({ 
    seasonRepository,
    prisma
  }: { 
    seasonRepository: ISeasonRepository
    prisma: PrismaClient
  }) {
    this.seasonRepository = seasonRepository
    this.standingsService = new StandingsService({ prisma })
  }

  async findAllSeasons() {
    return await this.seasonRepository.findAll()
  }

  async findSeasonById(id: string) {
    const season = await this.seasonRepository.findOneById(id)
    if (!season) {
      throw new SeasonNotFoundError()
    }
    return season
  }

  async findActiveSeason() {
    const season = await this.seasonRepository.findActiveSeason()
    if (!season) {
      throw new SeasonNotFoundError()
    }
    return season
  }

  async createSeason(data: Prisma.SeasonCreateInput) {
    const existing = await this.seasonRepository.findOneByNumber(data.number)
    if (existing) {
      throw new SeasonAlreadyExistsError()
    }

    if (data.isActive) {
      const activeSeason = await this.seasonRepository.findActiveSeason()
      if (activeSeason) {
        throw new ActiveSeasonAlreadyExistsError()
      }
    }

    return await this.seasonRepository.save(data)
  }

  async updateSeason(id: string, data: Prisma.SeasonUpdateInput) {
    const season = await this.seasonRepository.findOneById(id)
    if (!season) {
      throw new SeasonNotFoundError()
    }

    if (data.isActive === true) {
      const activeSeason = await this.seasonRepository.findActiveSeason()
      if (activeSeason && activeSeason.id !== id) {
        throw new ActiveSeasonAlreadyExistsError()
      }
    }

    return await this.seasonRepository.updateOneById(id, data)
  }

  async deleteSeason(id: string) {
    const season = await this.seasonRepository.findOneById(id)
    if (!season) {
      throw new SeasonNotFoundError()
    }
    return await this.seasonRepository.deleteOneById(id)
  }

  /**
   * Obtiene los movimientos de equipos de una temporada específica
   */
  async getSeasonMovements(seasonNumber: number) {
    // Buscar la temporada por número
    const season = await this.seasonRepository.findOneByNumber(seasonNumber)
    if (!season) {
      throw new SeasonNotFoundError()
    }

    // Obtener movimientos guardados en SeasonTransition
    const transitions = await this.seasonRepository.findTransitionsBySeason(season.id)
    
    return transitions.map((t: any) => ({
      clubId: t.clubId,
      clubName: t.club.name,
      fromCompetitionId: t.fromCompetitionId,
      fromLeague: t.fromCompetition.competitionType.name,
      toCompetitionId: t.toCompetitionId,
      toLeague: t.toCompetition?.competitionType.name || null,
      movementType: t.movementType,
      reason: t.reason,
      finalPosition: t.finalPosition
    }))
  }

  /**
   * Avanza a la siguiente temporada:
   * 1. Verifica que todos los partidos estén finalizados
   * 2. Calcula movimientos de equipos
   * 3. Guarda snapshots históricos
   * 4. Crea nueva temporada
   */
  async advanceSeason() {
    const currentSeason = await this.seasonRepository.findActiveSeason()
    if (!currentSeason) {
      throw new SeasonNotFoundError()
    }

    // Verificar que TODOS los partidos estén finalizados
    const pendingMatches = await this.seasonRepository.countPendingMatches(currentSeason.id)
    if (pendingMatches > 0) {
      throw new Error(`Cannot advance season: ${pendingMatches} matches are still pending`)
    }

    // Calcular movimientos
    const movements = await this.standingsService.calculateSeasonMovements(currentSeason.id)

    // Guardar en SeasonTransition
    await this.seasonRepository.saveTransitions(
      movements.map(m => ({
        seasonId: currentSeason.id,
        clubId: m.clubId,
        fromCompetitionId: m.fromCompetitionId,
        toCompetitionId: m.toCompetitionId,
        movementType: m.movementType,
        reason: m.reason,
        finalPosition: m.finalPosition
      }))
    )

    // Guardar snapshots históricos
    await this.standingsService.saveClubHistory(currentSeason.id)
    await this.standingsService.savePlayerStats(currentSeason.id)
    await this.standingsService.calculateCoefKempes(currentSeason.id)

    // Desactivar temporada actual y crear nueva
    await this.seasonRepository.updateOneById(currentSeason.id, { isActive: false })
    
    const newSeason = await this.seasonRepository.save({
      number: currentSeason.number + 1,
      isActive: true
    })

    return {
      previousSeason: currentSeason,
      newSeason,
      movements
    }
  }
}
