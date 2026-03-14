import {
  CompetitionAlreadyExistsError,
  CompetitionNotFoundError,
} from '@/features/competitions/competitions.errors'
import { ICompetitionRepository } from '@/features/competitions/interface/ICompetitionRepository'
import { ICompetitionTypeRepository } from '@/features/competition-types/interface/ICompetitionTypeRepository'
import { FixtureRepository } from '@/features/fixtures/fixtures.repository'
import { validateCompetitionRules, isLeaguesRules, isKempesCupRules, isCindorCupRules, isSuperCupRules } from '@/features/utils/jsonTypeChecker'
import {
  generateLeagueFixture,
  generateGroupStageFixture,
  generateDirectKnockoutBracket,
  generateEmptyBracketStructure,
  BracketTeamPlacement,
  EmptyBracketStructure,
  generateLiguillaFixture,
  generateTriangularFixture,
  generatePlayoutFixture,
  generateReducidoFixture,
  generatePromotionFixtures,
  PostSeasonTeam,
} from '@/features/utils/generateFixture'
import { KempesCupRules, LeaguesRules, CompetitionRules, CindorCupRules, SuperCupRules, TopLeagueRules, MiddleLeagueRules, BottomLeagueRules } from '@/types'
import { Competition, Match, Prisma, PrismaClient, CompetitionStage, CompetitionName, CompetitionCategory, MatchStatus, KnockoutRound } from '@prisma/client'
import { StandingsService } from '@/features/seasons/standings.service'

export class CompetitionService {
  private competitionRepository: ICompetitionRepository
  private competitionTypeRepository: ICompetitionTypeRepository
  private fixtureRepository: FixtureRepository
  private standingsService: StandingsService
  private prisma: PrismaClient

  constructor({
    competitionRepository,
    competitionTypeRepository,
    fixtureRepository,
    standingsService,
    prisma,
  }: {
    competitionRepository: ICompetitionRepository
    competitionTypeRepository: ICompetitionTypeRepository
    standingsService: StandingsService
    fixtureRepository: FixtureRepository
    prisma: PrismaClient
  }) {
    this.competitionRepository = competitionRepository
    this.competitionTypeRepository = competitionTypeRepository
    this.fixtureRepository = fixtureRepository
    this.standingsService = standingsService
    this.prisma = prisma
  }

  // Helper method para enriquecer competitions con competitionType data
  private async enrichCompetitionWithType(competition: Competition) {
    const competitionType = await this.competitionTypeRepository.findOneById(competition.competitionTypeId)

    if (!competitionType) {
      console.warn(`CompetitionType not found for competition ${competition.id} with typeId: ${competition.competitionTypeId}`)
    }

    return {
      competition,
      competitionTypeData: competitionType
        ? {
            id: competitionType.id,
            name: competitionType.name.toString(),
            category: competitionType.category.toString(),
            format: competitionType.format.toString(),
            hierarchy: competitionType.hierarchy,
          }
        : null,
    }
  }

  async findAllCompetitions() {
    // findAll() ya incluye competitionType gracias al include de Prisma
    const competitions = await this.competitionRepository.findAll()
    if (!competitions) return null

    // Mapear directamente usando los datos incluidos por Prisma
    return competitions.map((comp) => {
      const { competitionType } = comp

      if (!competitionType) {
        console.warn(`CompetitionType not included for competition ${comp.id} (${comp.name}) with typeId: ${comp.competitionTypeId}`)
      }

      return {
        competition: comp,
        competitionTypeData: competitionType
          ? {
              id: competitionType.id,
              name: competitionType.name.toString(),
              category: competitionType.category.toString(),
              format: competitionType.format.toString(),
              hierarchy: competitionType.hierarchy,
            }
          : null,
      }
    })
  }

  async findCompetition(id: string) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }
    return await this.enrichCompetitionWithType(competitionFound)
  }

  async createCompetition(config: Partial<LeaguesRules | KempesCupRules | CindorCupRules | SuperCupRules>) {
    const validatedConfig = validateCompetitionRules(config)

    // Verificar si ya existen competiciones del mismo tipo en esta temporada
    const existingCompetitions = await this.competitionRepository.findOneBySeasonId(
      validatedConfig.activeSeason.id
    )

    if (existingCompetitions && existingCompetitions.length > 0) {
      // Verificar si es el mismo tipo de competición
      const isCreatingLeagues = isLeaguesRules(validatedConfig)
      const isCreatingKempesCup = isKempesCupRules(validatedConfig)
      const isCreatingCindorCup = isCindorCupRules(validatedConfig)
      const isCreatingSuperCup = isSuperCupRules(validatedConfig)

      // Obtener los tipos de las competiciones existentes
      const existingTypeNames = await Promise.all(
        existingCompetitions.map(async (comp) => {
          const type = await this.competitionTypeRepository.findOneById(comp.competitionTypeId)
          return type?.name
        })
      )

      const hasExistingLeagues = existingTypeNames.some(name =>
        name && ['LEAGUE_A', 'LEAGUE_B', 'LEAGUE_C', 'LEAGUE_D', 'LEAGUE_E'].includes(name.toString())
      )
      const hasExistingKempesCup = existingTypeNames.some(name => name === 'KEMPES_CUP')
      const hasExistingCindorCup = existingTypeNames.some(name => name === 'CINDOR_CUP')
      const hasExistingSuperCup = existingTypeNames.some(name => name === 'SUPER_CUP')

      // Solo bloquear si ya existe el mismo tipo específico
      if (isCreatingLeagues && hasExistingLeagues) {
        throw new CompetitionAlreadyExistsError()
      }
      if (isCreatingKempesCup && hasExistingKempesCup) {
        throw new CompetitionAlreadyExistsError()
      }
      if (isCreatingCindorCup && hasExistingCindorCup) {
        throw new CompetitionAlreadyExistsError()
      }
      if (isCreatingSuperCup && hasExistingSuperCup) {
        throw new CompetitionAlreadyExistsError()
      }
    }

    // Si son ligas, crear todo en una transacción
    if (isLeaguesRules(validatedConfig)) {
      const leaguesConfig = validatedConfig as LeaguesRules
      const result = await this.prisma.$transaction(async (tx) => {
        const createdCompetitions: Competition[] = []
        const fixturesResults: { competition: Competition; matchesCreated: number; matches: Match[] }[] = []

        // Crear todas las competiciones y sus fixtures
        for (const league of leaguesConfig.leagues) {

          // Crear la competición y conectar equipos
          const competition = await tx.competition.create({
            data: {
              name: `${league.active_league.name} ${leaguesConfig.competitionCategory} - T${leaguesConfig.activeSeason.number}`,
              system: CompetitionStage.ROUND_ROBIN,
              competitionTypeId: league.active_league.id,
              seasonId: leaguesConfig.activeSeason.id,
              isActive: true,
              rules: league as unknown as Prisma.InputJsonValue,
              teams: {
                connect: league.clubIds.map((id: string) => ({ id })),
              },
            },
          })
          createdCompetitions.push(competition)

          // Generar fixtures para esta liga
          const matchesData = generateLeagueFixture(
            league.clubIds,
            competition.id,
            league.roundType === 'match_and_rematch'
          )

          // Crear todos los matches de una sola vez con createMany
          const createManyData = matchesData.map(m => ({
            competitionId: competition.id,
            homeClubId: (m.homeClub as any)?.connect?.id || null,
            awayClubId: (m.awayClub as any)?.connect?.id || null,
            matchdayOrder: m.matchdayOrder as number,
            stage: m.stage as CompetitionStage,
            status: m.status as MatchStatus,
          }))

          const { count: matchesCreated } = await tx.match.createMany({ data: createManyData })

          fixturesResults.push({
            competition,
            matchesCreated,
            matches: [] as Match[],
          })
        }

        return {
          success: true,
          competitions: createdCompetitions,
          fixtures: fixturesResults,
        }
      }, {
        timeout: 120000, // 2 minutos de timeout para muchas ligas con muchos equipos
      })

      return result
    }

    // Para Copa Kempes, crear SOLO la fase de grupos
    // Copa Oro y Copa Plata se crean después cuando termine la fase de grupos
    if (isKempesCupRules(validatedConfig)) {
      const cupConfig = validatedConfig as KempesCupRules

      const result = await this.prisma.$transaction(async (tx) => {
        const seasonNumber = cupConfig.activeSeason.number
        const category = cupConfig.competitionCategory

        // 1. Crear competición de Fase de Grupos (Copa Kempes)
        const groupStageCompetition = await tx.competition.create({
          data: {
            name: `Copa Kempes - Fase de Grupos ${category} - T${seasonNumber}`,
            system: CompetitionStage.ROUND_ROBIN,
            competitionTypeId: cupConfig.competitionType.id,
            seasonId: cupConfig.activeSeason.id,
            isActive: true,
            rules: cupConfig as unknown as Prisma.InputJsonValue,
          },
        })

        // 2. Conectar equipos a la competición
        const allClubIds = (cupConfig.groups || []).flatMap(g => g.clubIds)
        await tx.competition.update({
          where: { id: groupStageCompetition.id },
          data: { teams: { connect: allClubIds.map(id => ({ id })) } },
        })

        // 3. Generar matches de fase de grupos usando createMany (1 query en vez de N)
        const groupStageMatchData: Prisma.MatchCreateManyInput[] = []
        for (const group of cupConfig.groups || []) {
          const groupMatches = generateGroupStageFixture(
            group.clubIds,
            groupStageCompetition.id,
            group.groupName
          )
          for (const m of groupMatches) {
            groupStageMatchData.push({
              competitionId: groupStageCompetition.id,
              homeClubId: (m.homeClub as any)?.connect?.id || null,
              awayClubId: (m.awayClub as any)?.connect?.id || null,
              matchdayOrder: m.matchdayOrder as number,
              stage: m.stage as CompetitionStage,
              status: m.status as MatchStatus,
              homePlaceholder: (m.homePlaceholder as string) || null,
              awayPlaceholder: (m.awayPlaceholder as string) || null,
            })
          }
        }

        await tx.match.createMany({ data: groupStageMatchData })

        // Consultar los matches creados para retornarlos
        const createdGroupMatches = await tx.match.findMany({
          where: { competitionId: groupStageCompetition.id },
        })

        return {
          success: true,
          competitions: [groupStageCompetition],
          fixtures: [
            { competition: groupStageCompetition, matchesCreated: createdGroupMatches.length, matches: createdGroupMatches },
          ],
        }
      }, {
        timeout: 120000,
      })

      return result
    }

    // Copa Cindor (Kempesitas - eliminación directa)
    if (isCindorCupRules(validatedConfig)) {
      const cindorConfig = validatedConfig as CindorCupRules

      const result = await this.prisma.$transaction(async (tx) => {
        // Crear competición
        const competition = await tx.competition.create({
          data: {
            name: `Copa Cindor - T${cindorConfig.activeSeason.number}`,
            system: CompetitionStage.KNOCKOUT,
            competitionTypeId: cindorConfig.competitionType.id,
            seasonId: cindorConfig.activeSeason.id,
            isActive: true,
            rules: cindorConfig as unknown as Prisma.InputJsonValue,
          },
        })

        // Generar fixtures de eliminación directa con linking correcto
        const createdMatches = await this.createDirectKnockoutMatchesInTransaction(
          tx,
          competition.id,
          cindorConfig.teamIds
        )

        return {
          success: true,
          competitions: [competition],
          fixtures: [{ competition, matchesCreated: createdMatches.length, matches: createdMatches }],
        }
      }, { timeout: 60000 })

      return result
    }

    // Supercopa (6 equipos - mixta, sin categoría)
    if (isSuperCupRules(validatedConfig)) {
      const superConfig = validatedConfig as SuperCupRules

      const result = await this.prisma.$transaction(async (tx) => {
        // Crear competición
        const competition = await tx.competition.create({
          data: {
            name: `Supercopa - T${superConfig.activeSeason.number}`,
            system: CompetitionStage.KNOCKOUT,
            competitionTypeId: superConfig.competitionType.id,
            seasonId: superConfig.activeSeason.id,
            isActive: true,
            rules: superConfig as unknown as Prisma.InputJsonValue,
          },
        })

        // Generar fixtures de eliminación directa con linking correcto
        const createdMatches = await this.createDirectKnockoutMatchesInTransaction(
          tx,
          competition.id,
          superConfig.teamIds
        )

        return {
          success: true,
          competitions: [competition],
          fixtures: [{ competition, matchesCreated: createdMatches.length, matches: createdMatches }],
        }
      }, { timeout: 60000 })

      return result
    }

    throw new Error('Invalid competition configuration')
  }

  async updateCompetition(id: string, config: CompetitionRules) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }
    const updatedCompetition = await this.competitionRepository.updateOneById(id, config)
    return await this.enrichCompetitionWithType(updatedCompetition)
  }

  async toggleCompetitionActive(id: string, isActive: boolean) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }
    const updatedCompetition = await this.competitionRepository.updateIsActive(id, isActive)
    return await this.enrichCompetitionWithType(updatedCompetition)
  }

  async deleteCompetition(id: string) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }

    // Eliminar en transacción: primero matches relacionados, luego la competición
    await this.prisma.$transaction(async (tx) => {
      // Eliminar COVIDs de los matches de esta competición
      await tx.matchCovid.deleteMany({
        where: {
          match: {
            competitionId: id
          }
        }
      })

      // Eliminar matches de esta competición
      await tx.match.deleteMany({
        where: { competitionId: id }
      })

      // Eliminar la competición
      await tx.competition.delete({
        where: { id }
      })
    })
  }

  /**
   * Genera la estructura vacía del bracket para mostrar en el frontend
   * No crea nada en la base de datos
   */
  getBracketStructure(teamCount: number): EmptyBracketStructure {
    return generateEmptyBracketStructure(teamCount)
  }

  /**
   * Crea una Supercopa con posicionamiento manual de equipos
   */
  async createSupercupWithPlacements(config: {
    seasonId: string
    competitionTypeId: string
    teamPlacements: BracketTeamPlacement[]
  }) {
    // Extraer team IDs de los placements
    const teamIds = [...new Set(config.teamPlacements.map(p => p.teamId))]

    // Validar que sean exactamente 5 equipos
    if (teamIds.length !== 5) {
      throw new Error(`Supercopa requires exactly 5 teams, got ${teamIds.length}`)
    }

    const season = await this.prisma.season.findUnique({ where: { id: config.seasonId } })
    if (!season) {
      throw new Error('Season not found')
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Crear competición
      const competition = await tx.competition.create({
        data: {
          name: `Supercopa - T${season.number}`,
          system: CompetitionStage.KNOCKOUT,
          competitionTypeId: config.competitionTypeId,
          seasonId: config.seasonId,
          isActive: true,
          rules: {
            type: 'SUPER_CUP',
            teamCount: 5,
            teamPlacements: config.teamPlacements,
          } as unknown as Prisma.InputJsonValue,
        },
      })

      // Generar fixtures con placements manuales
      const createdMatches = await this.createDirectKnockoutMatchesInTransaction(
        tx,
        competition.id,
        teamIds,
        config.teamPlacements
      )

      return {
        success: true,
        competitions: [competition],
        fixtures: [{ competition, matchesCreated: createdMatches.length, matches: createdMatches }],
      }
    }, { timeout: 60000 })

    return result
  }

  /**
   * Crea una Copa Cindor con posicionamiento manual de equipos
   */
  async createCindorWithPlacements(config: {
    seasonId: string
    competitionTypeId: string
    teamPlacements: BracketTeamPlacement[]
  }) {
    // Extraer team IDs de los placements
    const teamIds = [...new Set(config.teamPlacements.map(p => p.teamId))]

    const season = await this.prisma.season.findUnique({ where: { id: config.seasonId } })
    if (!season) {
      throw new Error('Season not found')
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Crear competición
      const competition = await tx.competition.create({
        data: {
          name: `Copa Cindor - T${season.number}`,
          system: CompetitionStage.KNOCKOUT,
          competitionTypeId: config.competitionTypeId,
          seasonId: config.seasonId,
          isActive: true,
          rules: {
            type: 'CINDOR_CUP',
            teamCount: teamIds.length,
            teamPlacements: config.teamPlacements,
          } as unknown as Prisma.InputJsonValue,
        },
      })

      // Generar fixtures con placements manuales
      const createdMatches = await this.createDirectKnockoutMatchesInTransaction(
        tx,
        competition.id,
        teamIds,
        config.teamPlacements
      )

      return {
        success: true,
        competitions: [competition],
        fixtures: [{ competition, matchesCreated: createdMatches.length, matches: createdMatches }],
      }
    }, { timeout: 60000 })

    return result
  }

  /**
   * Crea partidos de knockout directo dentro de una transacción
   * Maneja correctamente las conexiones entre rondas y los BYEs
   */
  private async createDirectKnockoutMatchesInTransaction(
    tx: Prisma.TransactionClient,
    competitionId: string,
    teamIds: string[],
    teamPlacements?: BracketTeamPlacement[]
  ): Promise<Match[]> {
    const bracketResult = generateDirectKnockoutBracket(competitionId, teamIds, teamPlacements)
    const { matchesByRound, roundOrder, startRoundIndex } = bracketResult

    // Map para guardar: round_position -> matchId (para linking)
    const matchIdMap = new Map<string, string>()
    // Map para guardar: round_position -> byeTeamId (para propagar a siguiente ronda)
    const byeTeamMap = new Map<string, string>()

    const createdMatches: Match[] = []

    // Crear partidos ronda por ronda
    for (let roundIdx = startRoundIndex; roundIdx < roundOrder.length; roundIdx++) {
      const currentRound = roundOrder[roundIdx]
      const roundMatches = matchesByRound.get(currentRound) || []
      const isFirstRound = roundIdx === startRoundIndex

      for (const bracketMatch of roundMatches) {
        const { match, round, position, isBye, byeTeamId } = bracketMatch
        const key = `${round}_${position}`

        // Limpiar match data (remover undefined)
        const cleanedMatch: any = { ...match }
        if (!cleanedMatch.homeClub) delete cleanedMatch.homeClub
        if (!cleanedMatch.awayClub) delete cleanedMatch.awayClub

        if (!isFirstRound) {
          // Rondas posteriores: establecer sourceMatchId
          const prevRound = roundOrder[roundIdx - 1]
          const homeSourcePosition = position * 2 - 1
          const awaySourcePosition = position * 2

          const homeSourceKey = `${prevRound}_${homeSourcePosition}`
          const awaySourceKey = `${prevRound}_${awaySourcePosition}`

          const homeSourceMatchId = matchIdMap.get(homeSourceKey)
          const awaySourceMatchId = matchIdMap.get(awaySourceKey)

          const homeByeTeamId = byeTeamMap.get(homeSourceKey)
          const awayByeTeamId = byeTeamMap.get(awaySourceKey)

          // Si home viene de un BYE, asignar el equipo directamente
          if (homeByeTeamId) {
            cleanedMatch.homeClub = { connect: { id: homeByeTeamId } }
            cleanedMatch.homePlaceholder = null
          } else if (homeSourceMatchId) {
            cleanedMatch.homeSourceMatch = { connect: { id: homeSourceMatchId } }
            cleanedMatch.homeSourcePosition = 'WINNER'
          }

          // Si away viene de un BYE, asignar el equipo directamente
          if (awayByeTeamId) {
            cleanedMatch.awayClub = { connect: { id: awayByeTeamId } }
            cleanedMatch.awayPlaceholder = null
          } else if (awaySourceMatchId) {
            cleanedMatch.awaySourceMatch = { connect: { id: awaySourceMatchId } }
            cleanedMatch.awaySourcePosition = 'WINNER'
          }
        }

        // Crear el partido
        const createdMatch = await tx.match.create({ data: cleanedMatch })
        matchIdMap.set(key, createdMatch.id)
        createdMatches.push(createdMatch)

        // Si es BYE, guardar el equipo para propagarlo a la siguiente ronda
        if (isBye && byeTeamId) {
          byeTeamMap.set(key, byeTeamId)
        }
      }
    }

    return createdMatches
  }

  // ============================================
  // POST-SEASON GENERATION
  // ============================================

  /**
   * Genera los partidos de post-temporada para una liga
   * Lee las rules de la competición y genera:
   * - Liguilla/Triangular (campeonato)
   * - Playout (pelea por no descender)
   * - Reducido (pelea por ascender, solo BOTTOM)
   *
   * Requiere que TODOS los partidos de fase regular estén FINALIZADOS
   */
  async generatePostSeason(competitionId: string): Promise<{
    success: boolean
    matchesCreated: number
    phases: { phase: string; matchesCreated: number }[]
  }> {
    // 1. Obtener la competición con sus matches y rules
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        matches: true,
        teams: true,
        season: true,
        competitionType: true,
      },
    })

    if (!competition) {
      throw new CompetitionNotFoundError()
    }

    // 2. Verificar que todos los partidos de fase regular estén finalizados
    const regularMatches = competition.matches.filter(
      (m) => m.stage === CompetitionStage.ROUND_ROBIN
    )
    const pendingRegular = regularMatches.filter(
      (m) => m.status === MatchStatus.PENDIENTE
    )

    if (pendingRegular.length > 0) {
      throw new Error(
        `Cannot generate post-season: ${pendingRegular.length} regular season matches are still pending`
      )
    }

    // 3. Verificar que no existan ya partidos post-temporada
    const existingPostSeason = competition.matches.filter(
      (m) => m.stage === CompetitionStage.KNOCKOUT && m.knockoutRound !== null
    )
    if (existingPostSeason.length > 0) {
      throw new Error('Post-season matches already exist for this competition')
    }

    // 4. Obtener standings de la fase regular
    const standingsResult = await this.standingsService.calculateStandings(competitionId)
    const standings = standingsResult.standings

    // 5. Leer las rules de la competición
    const rules = competition.rules as unknown as (TopLeagueRules | BottomLeagueRules)

    // 6. Obtener la última jornada de la fase regular
    const lastMatchday = Math.max(...regularMatches.map((m) => m.matchdayOrder), 0)

    // 7. Generar partidos en transacción
    const result = await this.prisma.$transaction(async (tx) => {
      const phases: { phase: string; matchesCreated: number }[] = []
      let totalCreated = 0

      // --- CAMPEONATO (solo para liga TOP) ---
      if ('championship' in rules && rules.championship) {
        const championship = rules.championship

        if (championship.format === 'LIGUILLA') {
          const liguillaConfig = championship as { format: 'LIGUILLA'; teamsCount: number; keepPoints: boolean; roundType: string }
          const teamsCount = liguillaConfig.teamsCount || 4
          const liguillaTeams: PostSeasonTeam[] = standings
            .slice(0, teamsCount)
            .map((s) => ({ clubId: s.clubId, position: s.position }))

          const liguillaMatches = generateLiguillaFixture(
            liguillaTeams,
            competitionId,
            lastMatchday
          )

          for (const matchData of liguillaMatches) {
            await tx.match.create({ data: matchData })
            totalCreated++
          }

          phases.push({ phase: 'LIGUILLA', matchesCreated: liguillaMatches.length })
        } else if (championship.format === 'TRIANGULAR') {
          const team1st = { clubId: standings[0].clubId, position: 1 }
          const team2nd = { clubId: standings[1].clubId, position: 2 }
          const team3rd = { clubId: standings[2].clubId, position: 3 }

          const { semiMatch, finalMatch } = generateTriangularFixture(
            team1st, team2nd, team3rd,
            competitionId,
            lastMatchday
          )

          // Crear semi primero
          const createdSemi = await tx.match.create({ data: semiMatch })
          totalCreated++

          // Crear final con sourceMatch linking
          const finalData = {
            ...finalMatch,
            awaySourceMatch: { connect: { id: createdSemi.id } },
            awaySourcePosition: 'WINNER',
            awayPlaceholder: null as string | null,
          }
          // Limpiar placeholder
          delete (finalData as any).awayPlaceholder
          await tx.match.create({
            data: {
              ...finalData,
              awayPlaceholder: null,
            }
          })
          totalCreated++

          phases.push({ phase: 'TRIANGULAR', matchesCreated: 2 })
        }
        // FIRST_PLACE: no se generan partidos extra
      }

      // --- PLAYOUT ---
      if ('playout' in rules && rules.playout) {
        const playout = rules.playout
        const positions = playout.positions

        if (positions.length >= 2) {
          // Obtener equipos por posición en standings
          const teamA: PostSeasonTeam = {
            clubId: standings[positions[0] - 1].clubId,
            position: positions[0],
          }
          const teamB: PostSeasonTeam = {
            clubId: standings[positions[1] - 1].clubId,
            position: positions[1],
          }

          const playoutMatch = generatePlayoutFixture(teamA, teamB, competitionId, lastMatchday)
          await tx.match.create({ data: playoutMatch })
          totalCreated++

          phases.push({ phase: 'PLAYOUT', matchesCreated: 1 })
        }
      }

      // --- REDUCIDO (solo para liga BOTTOM) ---
      if ('reducido' in rules && rules.reducido) {
        const reducido = rules.reducido
        const startPos = reducido.startPositions
        const waitingPos = reducido.waitingPositions

        const startTeamA: PostSeasonTeam = {
          clubId: standings[startPos[0] - 1].clubId,
          position: startPos[0],
        }
        const startTeamB: PostSeasonTeam = {
          clubId: standings[startPos[1] - 1].clubId,
          position: startPos[1],
        }
        const waitingTeams: PostSeasonTeam[] = waitingPos.map((pos: number) => ({
          clubId: standings[pos - 1].clubId,
          position: pos,
        }))

        const reducidoMatches = generateReducidoFixture(
          startTeamA, startTeamB, waitingTeams,
          competitionId, lastMatchday
        )

        // Crear matches secuencialmente con sourceMatch linking
        let previousMatchId: string | null = null
        for (let i = 0; i < reducidoMatches.length; i++) {
          const matchData = { ...reducidoMatches[i] }

          // Para rondas posteriores a la primera, linkar con el match anterior
          if (i > 0 && previousMatchId) {
            (matchData as any).awaySourceMatch = { connect: { id: previousMatchId } };
            (matchData as any).awaySourcePosition = 'WINNER';
            (matchData as any).awayPlaceholder = null
            // Remover awayClub si existe (se asigna via sourceMatch)
            delete (matchData as any).awayClub
          }

          const created = await tx.match.create({ data: matchData })
          previousMatchId = created.id
          totalCreated++
        }

        phases.push({ phase: 'REDUCIDO', matchesCreated: reducidoMatches.length })
      }

      return { success: true, matchesCreated: totalCreated, phases }
    }, {
      timeout: 60000,
    })

    return result
  }

  /**
   * Obtiene el estado de la post-temporada de una competición
   */
  async getPostSeasonStatus(competitionId: string): Promise<{
    regularSeasonComplete: boolean
    regularMatchesPlayed: number
    regularMatchesTotal: number
    hasPostSeason: boolean
    postSeasonGenerated: boolean
    phases: {
      phase: string
      matches: { id: string; status: string; homeClubId: string | null; awayClubId: string | null; knockoutRound: string | null }[]
      isComplete: boolean
    }[]
  }> {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: { matches: true },
    })

    if (!competition) {
      throw new CompetitionNotFoundError()
    }

    const regularMatches = competition.matches.filter(
      (m) => m.stage === CompetitionStage.ROUND_ROBIN
    )
    const postSeasonMatches = competition.matches.filter(
      (m) => m.stage === CompetitionStage.KNOCKOUT
    )

    const regularComplete = regularMatches.every(
      (m) => m.status === MatchStatus.FINALIZADO || m.status === MatchStatus.CANCELADO
    )

    // Agrupar post-season matches por knockoutRound
    const phaseMap = new Map<string, typeof postSeasonMatches>()
    for (const match of postSeasonMatches) {
      const phase = match.knockoutRound || 'UNKNOWN'
      if (!phaseMap.has(phase)) phaseMap.set(phase, [])
      phaseMap.get(phase)!.push(match)
    }

    const phases = Array.from(phaseMap.entries()).map(([phase, matches]) => ({
      phase,
      matches: matches.map((m) => ({
        id: m.id,
        status: m.status,
        homeClubId: m.homeClubId,
        awayClubId: m.awayClubId,
        knockoutRound: m.knockoutRound,
      })),
      isComplete: matches.every(
        (m) => m.status === MatchStatus.FINALIZADO || m.status === MatchStatus.CANCELADO
      ),
    }))

    // Determinar si la competición tiene reglas de post-temporada configuradas
    const rules = competition.rules as any
    const hasPostSeason = Boolean(
      (rules?.championship && rules.championship.format !== 'FIRST_PLACE') ||
      rules?.playout ||
      rules?.reducido
    )

    return {
      regularSeasonComplete: regularComplete && regularMatches.length > 0,
      regularMatchesPlayed: regularMatches.filter(
        (m) => m.status === MatchStatus.FINALIZADO || m.status === MatchStatus.CANCELADO
      ).length,
      regularMatchesTotal: regularMatches.length,
      hasPostSeason,
      postSeasonGenerated: postSeasonMatches.length > 0,
      phases,
    }
  }

  // ============================================
  // PROMOTION COMPETITION (INTER-DIVISION)
  // ============================================

  /**
   * Genera una competencia de Promociones entre dos divisiones adyacentes.
   *
   * Flujo:
   * 1. Verifica que ambas ligas hayan completado su post-temporada interna
   * 2. Determina equipos de la liga superior que bajan a promoción
   *    (zona playoff relegation + perdedor de playout si existe)
   * 3. Determina equipos de la liga inferior que suben a promoción
   *    (zona promotion_playoff + ganador de reducido si existe)
   * 4. Empareja por seeding: mejor inferior vs peor superior
   * 5. Crea una nueva Competition tipo PROMOTIONS
   * 6. Genera los matches de promoción (partido único)
   *
   * @param upperCompetitionId - ID de la liga superior (ej: Liga A)
   * @param lowerCompetitionId - ID de la liga inferior (ej: Liga B)
   * @param seasonId - ID de la temporada activa
   */
  async generatePromotionCompetition(
    upperCompetitionId: string,
    lowerCompetitionId: string,
    seasonId: string
  ): Promise<{
    success: boolean
    competition: Competition
    matchesCreated: number
    upperTeams: PostSeasonTeam[]
    lowerTeams: PostSeasonTeam[]
  }> {
    // 1. Obtener ambas competiciones con sus datos
    const [upperComp, lowerComp] = await Promise.all([
      this.prisma.competition.findUnique({
        where: { id: upperCompetitionId },
        include: { matches: true, competitionType: true, season: true },
      }),
      this.prisma.competition.findUnique({
        where: { id: lowerCompetitionId },
        include: { matches: true, competitionType: true, season: true },
      }),
    ])

    if (!upperComp) throw new Error(`Upper competition not found: ${upperCompetitionId}`)
    if (!lowerComp) throw new Error(`Lower competition not found: ${lowerCompetitionId}`)

    // 1b. Verificar que no existan ya promociones para estas ligas en esta temporada
    const existingPromotions = await this.prisma.competition.findMany({
      where: {
        seasonId,
        competitionType: {
          name: CompetitionName.PROMOTIONS,
          category: upperComp.competitionType.category,
        },
      },
    })

    // Verificar en las rules si alguna ya es entre estas mismas ligas
    for (const existing of existingPromotions) {
      const existingRules = existing.rules as any
      if (
        existingRules?.upperCompetitionId === upperCompetitionId &&
        existingRules?.lowerCompetitionId === lowerCompetitionId
      ) {
        throw new Error('Ya existen promociones entre estas ligas para esta temporada')
      }
    }

    // 2. Verificar que ambas hayan completado su post-temporada
    const upperStatus = await this.getPostSeasonStatus(upperCompetitionId)
    const lowerStatus = await this.getPostSeasonStatus(lowerCompetitionId)

    if (!upperStatus.regularSeasonComplete) {
      throw new Error('Upper league regular season is not complete')
    }
    if (!lowerStatus.regularSeasonComplete) {
      throw new Error('Lower league regular season is not complete')
    }

    // Si tienen post-temporada configurada, debe estar generada y completa
    if (upperStatus.hasPostSeason) {
      if (!upperStatus.postSeasonGenerated) {
        throw new Error('Upper league post-season has not been generated yet')
      }
      const allComplete = upperStatus.phases.every((p) => p.isComplete)
      if (!allComplete) {
        throw new Error('Upper league post-season is not complete')
      }
    }
    if (lowerStatus.hasPostSeason) {
      if (!lowerStatus.postSeasonGenerated) {
        throw new Error('Lower league post-season has not been generated yet')
      }
      const allComplete = lowerStatus.phases.every((p) => p.isComplete)
      if (!allComplete) {
        throw new Error('Lower league post-season is not complete')
      }
    }

    // 3. Obtener standings de ambas ligas
    const [upperStandings, lowerStandings] = await Promise.all([
      this.standingsService.calculateStandings(upperCompetitionId),
      this.standingsService.calculateStandings(lowerCompetitionId),
    ])

    const upperRules = upperComp.rules as unknown as (TopLeagueRules | MiddleLeagueRules)
    const lowerRules = lowerComp.rules as unknown as (MiddleLeagueRules | BottomLeagueRules)

    // 4. Determinar equipos de la liga superior que entran a promoción
    const upperTeamsForPromotion: PostSeasonTeam[] = []

    const upperPlayoffRelegations = ('relegations' in upperRules && upperRules.relegations?.promotion?.quantity) || 0
    const upperDirectRelegations = ('relegations' in upperRules && upperRules.relegations?.direct?.quantity) || 0
    const upperTotal = upperStandings.standings.length

    // Verificar si hay playout que ocupa un cupo de playoffRelegations
    const hasPlayout = 'playout' in upperRules && upperRules.playout
    let playoutLoserId: string | null = null

    if (hasPlayout) {
      // Buscar perdedor del playout
      const playoutMatches = upperComp.matches.filter(
        (m) => m.knockoutRound === KnockoutRound.PLAYOUT && m.status === MatchStatus.FINALIZADO
      )
      for (const playoutMatch of playoutMatches) {
        if (playoutMatch.homeClubGoals !== null && playoutMatch.awayClubGoals !== null) {
          playoutLoserId = playoutMatch.homeClubGoals > playoutMatch.awayClubGoals
            ? playoutMatch.awayClubId
            : playoutMatch.homeClubId
        }
      }
    }

    // Si hay playout con resultado, el último cupo de playoffRelegations lo ocupa el perdedor del playout
    // Los demás cupos van directo por posición en tabla
    const directRelegationSlots = hasPlayout && playoutLoserId
      ? upperPlayoffRelegations - 1
      : upperPlayoffRelegations

    // Equipos que van DIRECTO a promoción por posición (sin pasar por playout)
    for (let i = 0; i < directRelegationSlots; i++) {
      const position = upperTotal - upperDirectRelegations - i
      if (position > 0 && position <= upperTotal) {
        const team = upperStandings.standings[position - 1]
        upperTeamsForPromotion.push({ clubId: team.clubId, position })
      }
    }

    // Agregar perdedor del playout
    if (playoutLoserId) {
      const pos = upperStandings.standings.findIndex((s) => s.clubId === playoutLoserId)
      upperTeamsForPromotion.push({ clubId: playoutLoserId, position: pos + 1 })
    }

    // 5. Determinar equipos de la liga inferior que entran a promoción
    const lowerTeamsForPromotion: PostSeasonTeam[] = []

    const lowerPlayoffPromotions = ('promotions' in lowerRules && lowerRules.promotions?.playoff?.quantity) || 0
    const lowerDirectPromotions = ('promotions' in lowerRules && lowerRules.promotions?.direct?.quantity) || 0

    // Verificar si hay reducido que ocupa un cupo de playoffPromotions
    const hasReducido = 'reducido' in lowerRules && lowerRules.reducido
    let reducidoWinnerId: string | null = null

    if (hasReducido) {
      // Buscar ganador del reducido (REDUCIDO_FINAL)
      const reducidoFinals = lowerComp.matches.filter(
        (m) => m.knockoutRound === KnockoutRound.REDUCIDO_FINAL && m.status === MatchStatus.FINALIZADO
      )
      for (const finalMatch of reducidoFinals) {
        if (finalMatch.homeClubGoals !== null && finalMatch.awayClubGoals !== null) {
          reducidoWinnerId = finalMatch.homeClubGoals > finalMatch.awayClubGoals
            ? finalMatch.homeClubId
            : finalMatch.awayClubId
        }
      }
    }

    // Si hay reducido con ganador, el último cupo de playoffPromotions lo ocupa el ganador del reducido
    // Los demás cupos van directo por posición en tabla
    const directPlayoffSlots = hasReducido && reducidoWinnerId
      ? lowerPlayoffPromotions - 1
      : lowerPlayoffPromotions

    // Equipos que van DIRECTO a promoción (por posición en tabla)
    for (let i = 0; i < directPlayoffSlots; i++) {
      const position = lowerDirectPromotions + 1 + i
      if (position > 0 && position <= lowerStandings.standings.length) {
        const team = lowerStandings.standings[position - 1]
        lowerTeamsForPromotion.push({ clubId: team.clubId, position })
      }
    }

    // Agregar ganador del reducido
    if (reducidoWinnerId) {
      const pos = lowerStandings.standings.findIndex((s) => s.clubId === reducidoWinnerId)
      lowerTeamsForPromotion.push({ clubId: reducidoWinnerId, position: pos + 1 })
    }

    if (upperTeamsForPromotion.length === 0 && lowerTeamsForPromotion.length === 0) {
      throw new Error('No teams qualify for promotion matches between these leagues')
    }

    // Asegurar cantidades iguales (emparejar los que haya)
    const matchCount = Math.min(upperTeamsForPromotion.length, lowerTeamsForPromotion.length)
    if (matchCount === 0) {
      throw new Error('Cannot create promotion matches: one side has no qualifying teams')
    }

    // Ordenar: upper teams por posición descendente (peor primero)
    upperTeamsForPromotion.sort((a, b) => b.position - a.position)
    // Ordenar: lower teams por posición ascendente (mejor primero)
    lowerTeamsForPromotion.sort((a, b) => a.position - b.position)

    // Recortar al matchCount
    const finalUpperTeams = upperTeamsForPromotion.slice(0, matchCount)
    const finalLowerTeams = lowerTeamsForPromotion.slice(0, matchCount)

    // 6. Crear la competencia de Promociones
    const result = await this.prisma.$transaction(async (tx) => {
      // Find or create PROMOTIONS CompetitionType
      const category = upperComp.competitionType.category
      let promoType = await tx.competitionType.findFirst({
        where: { name: CompetitionName.PROMOTIONS, category },
      })
      if (!promoType) {
        promoType = await tx.competitionType.create({
          data: {
            name: CompetitionName.PROMOTIONS,
            category,
            format: 'CUP',
            hierarchy: 15,
          },
        })
      }

      const seasonNumber = upperComp.season.number
      const upperName = upperComp.competitionType.name
      const lowerName = lowerComp.competitionType.name

      // Create the Promotions competition
      const promoCompetition = await tx.competition.create({
        data: {
          name: `Promociones ${category} ${upperName}/${lowerName} - T${seasonNumber}`,
          system: CompetitionStage.KNOCKOUT,
          competitionTypeId: promoType.id,
          seasonId,
          isActive: true,
          rules: {
            type: 'PROMOTIONS',
            upperCompetitionId,
            lowerCompetitionId,
            upperTeams: finalUpperTeams,
            lowerTeams: finalLowerTeams,
          } as unknown as Prisma.InputJsonValue,
        },
      })

      // Connect teams to the promotion competition
      const allTeamIds = [...finalUpperTeams, ...finalLowerTeams].map((t) => t.clubId)
      await tx.competition.update({
        where: { id: promoCompetition.id },
        data: {
          teams: {
            connect: allTeamIds.map((id) => ({ id })),
          },
        },
      })

      // Generate promotion matches
      const promoMatches = generatePromotionFixtures(
        finalUpperTeams,
        finalLowerTeams,
        promoCompetition.id
      )

      for (const matchData of promoMatches) {
        await tx.match.create({ data: matchData })
      }

      return {
        success: true as const,
        competition: promoCompetition,
        matchesCreated: promoMatches.length,
        upperTeams: finalUpperTeams,
        lowerTeams: finalLowerTeams,
      }
    }, { timeout: 60000 })

    return result
  }
}
