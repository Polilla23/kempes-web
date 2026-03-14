import { Prisma, PrismaClient, MatchStatus, CompetitionFormat, CompetitionStage, SeasonHalfType } from '@prisma/client'
import { ISeasonRepository } from '@/features/seasons/interface/ISeasonRepository'
import {
  SeasonNotFoundError,
  SeasonAlreadyExistsError,
  ActiveSeasonAlreadyExistsError
} from '@/features/seasons/seasons.errors'
import { StandingsService } from '@/features/seasons/standings.service'
import { SeasonHalfService } from '@/features/season-halves/season-halves.service'

export class SeasonService {
  private seasonRepository: ISeasonRepository
  private seasonHalfService: SeasonHalfService
  private standingsService: StandingsService
  private prisma: PrismaClient

  constructor({
    seasonRepository,
    seasonHalfService,
    prisma
  }: {
    seasonRepository: ISeasonRepository
    seasonHalfService: SeasonHalfService
    prisma: PrismaClient
  }) {
    this.seasonRepository = seasonRepository
    this.seasonHalfService = seasonHalfService
    this.standingsService = new StandingsService({ prisma })
    this.prisma = prisma
  }

  private async initializeSeasonHalves(seasonId: string): Promise<void> {
    const halves = await this.seasonHalfService.createSeasonHalves(seasonId)
    const firstHalf = halves?.find((h: any) => h.halfType === SeasonHalfType.FIRST_HALF)
    if (firstHalf) {
      await this.seasonHalfService.activateSeasonHalf(firstHalf.id)
    }
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

    const newSeason = await this.seasonRepository.save(data)
    await this.initializeSeasonHalves(newSeason.id)
    return newSeason
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
  async getSeasonMovements(seasonNumber: number, category?: string) {
    // Buscar la temporada por número
    const season = await this.seasonRepository.findOneByNumber(seasonNumber)
    if (!season) {
      throw new SeasonNotFoundError()
    }

    // Obtener movimientos guardados en SeasonTransition
    const transitions = await this.seasonRepository.findTransitionsBySeason(season.id)

    // Filtrar por categoría en el service layer
    const filtered = category
      ? transitions.filter((t: any) => t.fromCompetition.competitionType.category === category)
      : transitions

    return filtered.map((t: any) => ({
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
    await this.initializeSeasonHalves(newSeason.id)

    return {
      previousSeason: currentSeason,
      newSeason,
      movements
    }
  }

  // ============================================
  // WIZARD DE AVANCE — 4 PASOS DISCRETOS
  // ============================================

  /**
   * Paso 1: Verificar que todas las competencias estén finalizadas
   */
  async verifyCompetitions() {
    const currentSeason = await this.seasonRepository.findActiveSeason()
    if (!currentSeason) {
      throw new SeasonNotFoundError()
    }

    // Obtener todas las competencias de la temporada con sus matches
    const competitions = await this.prisma.competition.findMany({
      where: { seasonId: currentSeason.id },
      include: {
        competitionType: true,
        matches: {
          select: { status: true, stage: true, knockoutRound: true },
        },
      },
      orderBy: { competitionType: { hierarchy: 'asc' } },
    })

    const competitionStatuses = competitions.map((comp) => {
      const totalMatches = comp.matches.length
      const completedMatches = comp.matches.filter(
        (m) => m.status === MatchStatus.FINALIZADO || m.status === MatchStatus.CANCELADO
      ).length
      const pendingMatches = totalMatches - completedMatches

      // Post-season status: check knockout matches
      const knockoutMatches = comp.matches.filter(
        (m) => m.stage === CompetitionStage.KNOCKOUT
      )
      const regularMatches = comp.matches.filter(
        (m) => m.stage === CompetitionStage.ROUND_ROBIN
      )
      const regularComplete = regularMatches.every(
        (m) => m.status === MatchStatus.FINALIZADO || m.status === MatchStatus.CANCELADO
      )
      const postSeasonComplete =
        knockoutMatches.length === 0 ||
        knockoutMatches.every((m) => m.status === MatchStatus.FINALIZADO || m.status === MatchStatus.CANCELADO)

      return {
        id: comp.id,
        name: comp.name,
        format: comp.competitionType.format,
        category: comp.competitionType.category,
        totalMatches,
        completedMatches,
        pendingMatches,
        regularComplete,
        postSeasonComplete,
        hasPostSeason: knockoutMatches.length > 0,
      }
    })

    const allCompleted = competitionStatuses.every((c) => c.pendingMatches === 0)

    return {
      season: { id: currentSeason.id, number: currentSeason.number },
      allCompleted,
      competitions: competitionStatuses,
    }
  }

  /**
   * Paso 2: Previsualizar movimientos (solo lectura)
   */
  async previewMovements() {
    const currentSeason = await this.seasonRepository.findActiveSeason()
    if (!currentSeason) {
      throw new SeasonNotFoundError()
    }

    const movements = await this.standingsService.calculateSeasonMovements(currentSeason.id)

    const summary = {
      champions: movements.filter((m) => m.movementType === 'CHAMPION').length,
      promotions: movements.filter((m) =>
        ['DIRECT_PROMOTION', 'PLAYOFF_PROMOTION', 'REDUCIDO_PROMOTION'].includes(m.movementType)
      ).length,
      relegations: movements.filter((m) =>
        ['DIRECT_RELEGATION', 'PLAYOFF_RELEGATION'].includes(m.movementType)
      ).length,
      stayed: movements.filter((m) => m.movementType === 'STAYED').length,
    }

    return {
      season: { id: currentSeason.id, number: currentSeason.number },
      movements,
      summary,
    }
  }

  /**
   * Paso 3: Guardar historial (idempotente)
   */
  async saveSeasonHistory() {
    const currentSeason = await this.seasonRepository.findActiveSeason()
    if (!currentSeason) {
      throw new SeasonNotFoundError()
    }

    // Verificar si ya se guardó el historial (idempotencia)
    const existingTransitions = await this.seasonRepository.findTransitionsBySeason(currentSeason.id)

    // Calcular movimientos y cache de standings una sola vez
    const { movements, standingsCache } = await this.standingsService.calculateSeasonMovementsWithCache(currentSeason.id)

    let movementsSaved = existingTransitions.length
    if (existingTransitions.length === 0) {
      await this.seasonRepository.saveTransitions(
        movements.map((m) => ({
          seasonId: currentSeason.id,
          clubId: m.clubId,
          fromCompetitionId: m.fromCompetitionId,
          toCompetitionId: m.toCompetitionId,
          movementType: m.movementType,
          reason: m.reason,
          finalPosition: m.finalPosition,
        }))
      )
      movementsSaved = movements.length
    }

    // Verificar si ya hay historial de clubes
    const existingHistory = await this.prisma.clubHistory.count({
      where: { seasonId: currentSeason.id },
    })

    let clubHistorySaved = existingHistory
    if (existingHistory === 0) {
      await this.standingsService.saveClubHistory(currentSeason.id, standingsCache, movements)
      clubHistorySaved = await this.prisma.clubHistory.count({
        where: { seasonId: currentSeason.id },
      })
    }

    // Verificar si ya hay stats de jugadores
    const existingPlayerStats = await this.prisma.playerSeasonStats.count({
      where: { seasonId: currentSeason.id },
    })

    let playerStatsSaved = existingPlayerStats
    if (existingPlayerStats === 0) {
      await this.standingsService.savePlayerStats(currentSeason.id)
      playerStatsSaved = await this.prisma.playerSeasonStats.count({
        where: { seasonId: currentSeason.id },
      })
    }

    // Verificar si ya hay coef kempes
    const existingCoefKempes = await this.prisma.coefKempes.count({
      where: { seasonId: currentSeason.id },
    })

    let coefKempesSaved = existingCoefKempes
    if (existingCoefKempes === 0) {
      await this.standingsService.calculateCoefKempes(currentSeason.id)
      coefKempesSaved = await this.prisma.coefKempes.count({
        where: { seasonId: currentSeason.id },
      })
    }

    return {
      season: { id: currentSeason.id, number: currentSeason.number },
      movementsSaved,
      clubHistorySaved,
      playerStatsSaved,
      coefKempesSaved,
      alreadyExisted: existingTransitions.length > 0,
    }
  }

  /**
   * Paso 4: Crear nueva temporada
   */
  async createNextSeason() {
    const currentSeason = await this.seasonRepository.findActiveSeason()
    if (!currentSeason) {
      throw new SeasonNotFoundError()
    }

    // Verificar que se haya guardado historial antes de avanzar
    const existingTransitions = await this.seasonRepository.findTransitionsBySeason(currentSeason.id)
    if (existingTransitions.length === 0) {
      throw new Error('Must save season history before creating next season')
    }

    // Desactivar temporada actual
    await this.seasonRepository.updateOneById(currentSeason.id, { isActive: false })

    // Crear nueva temporada
    const newSeason = await this.seasonRepository.save({
      number: currentSeason.number + 1,
      isActive: true,
    })
    await this.initializeSeasonHalves(newSeason.id)

    return {
      previousSeason: currentSeason,
      newSeason,
    }
  }
}
