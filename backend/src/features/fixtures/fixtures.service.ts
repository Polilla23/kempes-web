import { FixtureRepository } from '@/features/fixtures/fixtures.repository'
import { CompetitionRepository } from '@/features/competitions/competitions.repository'
import { MatchStatus, CompetitionStage, Prisma, PrismaClient, CompetitionName, KnockoutRound } from '@prisma/client'
import {
  BracketMatch,
  KnockoutFixtureInput,
  KnockoutFixtureResponse,
  LeagueFixtureInput,
  LeagueFixtureResponse,
  GroupStageFixtureInput,
  GroupStageFixtureResponse,
  FinishMatchInput,
  FinishMatchResponse,
} from '@/types'
import { MatchMapper } from '@/mappers'
import { sortBracketsByRound, buildKnockoutMatchData } from '@/features/utils/generateKnockoutFixture'
import { generateLeagueFixture, generateGroupStageFixture, generateDirectKnockoutBracket, BracketTeamPlacement } from '@/features/utils/generateFixture'
import { CompetitionNotFoundError } from '@/features/competitions/competitions.errors'
import {
  KnockoutMatchDrawError,
  MatchAlreadyFinalizedError,
  MatchNotAssignedError,
  MatchNotFoundError,
  UserNotClubOwnerError,
  GoalEventsMismatchError,
  MvpRequiredError,
} from '@/features/fixtures/fixtures.errors'
import { SubmitResultInput, AdminEditResultInput } from '@/types'
import { StandingsService } from '@/features/seasons/standings.service'

// Type for qualified team info
type QualifiedTeam = {
  clubId: string
  clubName: string
  clubLogo?: string
  groupName: string
  position: number
}

export class FixtureService {
  private fixtureRepository: FixtureRepository
  private competitionRepository: CompetitionRepository
  private prisma: PrismaClient
  private standingsService: StandingsService

  constructor({
    fixtureRepository,
    competitionRepository,
    prisma,
    standingsService,
  }: {
    fixtureRepository: FixtureRepository
    competitionRepository: CompetitionRepository
    prisma: PrismaClient
    standingsService: StandingsService
  }) {
    this.fixtureRepository = fixtureRepository
    this.competitionRepository = competitionRepository
    this.prisma = prisma
    this.standingsService = standingsService
  }

  // ===================== KNOCKOUT STAGE =====================

  /**
   *
   * Create knockout bracket with match dependencies
   */

  async createKnockoutFixture(input: KnockoutFixtureInput): Promise<KnockoutFixtureResponse> {
    const competition = await this.competitionRepository.findOneById(input.competitionId)
    if (!competition) {
      throw new CompetitionNotFoundError()
    }

    const matchIdMap = new Map<string, string>()
    const sortedBrackets = sortBracketsByRound(input.brackets)

    for (const bracket of sortedBrackets) {
      const matchData = buildKnockoutMatchData(bracket, input.competitionId, matchIdMap)
      const match = await this.fixtureRepository.createMatch(matchData)
      matchIdMap.set(`${bracket.round}_${bracket.position}`, match.id)
    }

    return {
      success: true,
      competitionId: input.competitionId,
      matchesCreated: sortedBrackets.length,
    }
  }

  /**
   *
   * Finish match and auto-update dependent matches
   */

  async finishMatch(input: FinishMatchInput): Promise<FinishMatchResponse> {
    const match = await this.fixtureRepository.findById(input.matchId)
    if (!match) {
      throw new MatchNotFoundError() // TODO: Custom error
    }

    if (match.status === MatchStatus.FINALIZADO) {
      throw new MatchAlreadyFinalizedError() // TODO: Custom error
    }

    if (!match.homeClubId || !match.awayClubId) {
      throw new MatchNotAssignedError() // TODO: Custom error
    }

    // Knockout matches cannot draw EXCEPT for LIGUILLA (which is a round-robin mini-league)
    if (
      match.stage === CompetitionStage.KNOCKOUT &&
      input.homeClubGoals === input.awayClubGoals &&
      match.knockoutRound !== KnockoutRound.LIGUILLA
    ) {
      throw new KnockoutMatchDrawError() // TODO: Custom error
    }

    const updatedMatch = await this.fixtureRepository.updateMatch(input.matchId, {
      homeClubGoals: input.homeClubGoals,
      awayClubGoals: input.awayClubGoals,
      status: MatchStatus.FINALIZADO,
      resultRecordedAt: new Date(),
    })

    const winnerId = input.homeClubGoals > input.awayClubGoals ? match.homeClubId : match.awayClubId
    const loserId = input.homeClubGoals > input.awayClubGoals ? match.awayClubId : match.homeClubId

    const dependentMatches = await this.fixtureRepository.findMatchesDependingOn(input.matchId)

    const updates = []
    for (const nextMatch of dependentMatches) {
      const updateData: Prisma.MatchUpdateInput = {}

      if (nextMatch.homeSourceMatchId === input.matchId) {
        updateData.homeClub = {
          connect: { id: nextMatch.homeSourcePosition === 'WINNER' ? winnerId : loserId },
        }
        updateData.homePlaceholder = null
      }

      if (nextMatch.awaySourceMatchId === input.matchId) {
        updateData.awayClub = {
          connect: { id: nextMatch.awaySourcePosition === 'WINNER' ? winnerId : loserId },
        }
        updateData.awayPlaceholder = null
      }

      const updated = await this.fixtureRepository.updateMatch(nextMatch.id, updateData)
      updates.push(updated)
    }

    // Refresh standings snapshot (fire-and-forget)
    this.standingsService.refreshStandingsSnapshot(match.competitionId).catch((err) => {
      console.error('Error refreshing standings snapshot:', err)
    })

    return {
      success: true,
      match: updatedMatch,
      dependentMatchesUpdated: updates.length,
      updatedMatches: updates,
    }
  }

  //==================== GROUP STAGE =====================

  /**
   * Create group stage fixtures (round-robin within groups)
   *
   */

  async createGroupStageFixtures(input: GroupStageFixtureInput): Promise<GroupStageFixtureResponse> {
    const competition = await this.competitionRepository.findOneById(input.competitionId)
    if (!competition) {
      throw new CompetitionNotFoundError()
    }

    const allMatches: Prisma.MatchCreateInput[] = []

    for (const group of input.groups) {
      const groupMatches = generateGroupStageFixture(group.clubIds, input.competitionId, group.groupName)
      allMatches.push(...groupMatches)
    }

    const created = await this.fixtureRepository.createManyMatches(allMatches)

    return {
      success: true,
      matchesCreated: created.length,
      competitionId: input.competitionId,
    }
  }

  // ===================== LEAGUE =====================

  /**
   * Create league fixtures (double round-robin)
   */
  async createLeagueFixture(input: LeagueFixtureInput): Promise<LeagueFixtureResponse> {
    const competition = await this.competitionRepository.findOneById(input.competitionId)
    if (!competition) {
      throw new CompetitionNotFoundError()
    }

    const matches = generateLeagueFixture(
      input.clubIds,
      input.competitionId,
      true // Always rematch for leagues
    )

    const created = await this.fixtureRepository.createManyMatches(matches)

    // Generar COVIDs para todos los partidos creados (solo SENIOR)
    const competitionWithType = await this.competitionRepository.findOneByIdWithType(input.competitionId)
    if (competitionWithType?.competitionType.category === 'SENIOR') {
      const createdMatches = await this.fixtureRepository.getMatchesByCompetition(input.competitionId)
      
      for (const match of createdMatches) {
        if (match.status === 'PENDIENTE' && match.homeClubId && match.awayClubId) {
          try {
            await this.generateMatchCovids(match.id, match.homeClubId, match.awayClubId)
          } catch (error) {
            console.error(`Error generating COVIDs for match ${match.id}:`, error)
            // Continue with next match even if COVID generation fails
          }
        }
      }
    }

    return {
      success: true,
      competitionId: input.competitionId,
      matchesCreated: created.length,
    }
  }

  // ===================== DIRECT KNOCKOUT (Cindor & Supercopa) =====================

  /**
   * Create direct knockout fixture for Copa Cindor and Supercopa
   * Teams are assigned directly (no group stage placeholders)
   *
   * Flujo:
   * 1. Genera estructura del bracket
   * 2. Crea partidos ronda por ronda
   * 3. Establece sourceMatchId para conectar rondas
   * 4. Para BYEs: asigna equipo directamente a la siguiente ronda
   */
  async createDirectKnockoutFixture(input: { competitionId: string; teamIds: string[] }) {
    const competition = await this.competitionRepository.findOneById(input.competitionId)
    if (!competition) {
      throw new CompetitionNotFoundError()
    }

    const bracketResult = generateDirectKnockoutBracket(input.competitionId, input.teamIds)
    const { matchesByRound, roundOrder, startRoundIndex } = bracketResult

    // Map para guardar: round_position -> matchId (para linking)
    const matchIdMap = new Map<string, string>()
    // Map para guardar: round_position -> byeTeamId (para propagar a siguiente ronda)
    const byeTeamMap = new Map<string, string>()

    let totalMatchesCreated = 0

    // Crear partidos ronda por ronda
    for (let roundIdx = startRoundIndex; roundIdx < roundOrder.length; roundIdx++) {
      const currentRound = roundOrder[roundIdx]
      const roundMatches = matchesByRound.get(currentRound) || []
      const isFirstRound = roundIdx === startRoundIndex

      for (const bracketMatch of roundMatches) {
        const { match, round, position, isBye, byeTeamId } = bracketMatch
        const key = `${round}_${position}`

        // Limpiar match data (remover undefined)
        const cleanedMatch = { ...match }
        if (!cleanedMatch.homeClub) delete (cleanedMatch as any).homeClub
        if (!cleanedMatch.awayClub) delete (cleanedMatch as any).awayClub

        if (!isFirstRound) {
          // Rondas posteriores: establecer sourceMatchId
          const prevRound = roundOrder[roundIdx - 1]
          const homeSourcePosition = position * 2 - 1  // Posición del partido home en ronda anterior
          const awaySourcePosition = position * 2      // Posición del partido away en ronda anterior

          const homeSourceKey = `${prevRound}_${homeSourcePosition}`
          const awaySourceKey = `${prevRound}_${awaySourcePosition}`

          const homeSourceMatchId = matchIdMap.get(homeSourceKey)
          const awaySourceMatchId = matchIdMap.get(awaySourceKey)

          // Verificar si hay BYEs de la ronda anterior
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
        const createdMatch = await this.fixtureRepository.createMatch(cleanedMatch)
        matchIdMap.set(key, createdMatch.id)
        totalMatchesCreated++

        // Si es BYE, guardar el equipo para propagarlo a la siguiente ronda
        if (isBye && byeTeamId) {
          byeTeamMap.set(key, byeTeamId)
        }
      }
    }

    return {
      success: true,
      competitionId: input.competitionId,
      matchesCreated: totalMatchesCreated,
      totalTeams: input.teamIds.length,
    }
  }

  // ===================== COPA ORO / COPA PLATA GENERATION =====================

  /**
   * Genera Copa Oro y Copa Plata a partir de los equipos clasificados de Copa Kempes.
   * El admin define los cruces manualmente con BracketTeamPlacement[].
   * Usa generateDirectKnockoutBracket para crear matches con sourceMatch linking correcto.
   */
  async generateGoldSilverCups(input: {
    kempesCupId: string
    goldTeams: QualifiedTeam[]
    silverTeams: QualifiedTeam[]
    goldTeamPlacements: BracketTeamPlacement[]
    silverTeamPlacements: BracketTeamPlacement[]
  }) {
    const kempesCup = await this.competitionRepository.findOneById(input.kempesCupId)
    if (!kempesCup) {
      throw new CompetitionNotFoundError()
    }

    // Get season info and category from Kempes Cup
    const kempesCupWithDetails = await this.prisma.competition.findUnique({
      where: { id: input.kempesCupId },
      include: {
        season: true,
        competitionType: true,
      },
    })

    if (!kempesCupWithDetails) {
      throw new CompetitionNotFoundError()
    }

    const seasonNumber = kempesCupWithDetails.season.number
    const category = kempesCupWithDetails.competitionType.category

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Find or create GOLD_CUP CompetitionType
      let goldCupType = await tx.competitionType.findFirst({
        where: { name: CompetitionName.GOLD_CUP, category },
      })
      if (!goldCupType) {
        goldCupType = await tx.competitionType.create({
          data: {
            name: CompetitionName.GOLD_CUP,
            category,
            format: 'CUP',
            hierarchy: 10,
          },
        })
      }

      // 2. Create Copa Oro competition
      const goldCupCompetition = await tx.competition.create({
        data: {
          name: `Copa de Oro ${category} - T${seasonNumber}`,
          system: CompetitionStage.KNOCKOUT,
          competitionTypeId: goldCupType.id,
          seasonId: kempesCupWithDetails.seasonId,
          isActive: true,
          rules: {
            type: 'CUP_KNOCKOUT',
            parentCup: input.kempesCupId,
            cupType: 'GOLD',
          } as unknown as Prisma.InputJsonValue,
        },
      })

      // 3. Connect gold teams to Copa Oro
      await tx.competition.update({
        where: { id: goldCupCompetition.id },
        data: {
          teams: {
            connect: input.goldTeams.map((t) => ({ id: t.clubId })),
          },
        },
      })

      // 4. Generate Copa Oro matches with proper sourceMatch linking
      const goldTeamIds = input.goldTeams.map(t => t.clubId)
      const goldCreatedMatches = await this.createKnockoutMatchesInTransaction(
        tx,
        goldCupCompetition.id,
        goldTeamIds,
        input.goldTeamPlacements
      )

      // 5. Find or create SILVER_CUP CompetitionType (if there are silver teams)
      let silverCupCompetition = null
      let silverMatchesCreated = 0
      if (input.silverTeams.length > 0) {
        let silverCupType = await tx.competitionType.findFirst({
          where: { name: CompetitionName.SILVER_CUP, category },
        })
        if (!silverCupType) {
          silverCupType = await tx.competitionType.create({
            data: {
              name: CompetitionName.SILVER_CUP,
              category,
              format: 'CUP',
              hierarchy: 11,
            },
          })
        }

        // 6. Create Copa Plata competition
        silverCupCompetition = await tx.competition.create({
          data: {
            name: `Copa de Plata ${category} - T${seasonNumber}`,
            system: CompetitionStage.KNOCKOUT,
            competitionTypeId: silverCupType.id,
            seasonId: kempesCupWithDetails.seasonId,
            isActive: true,
            rules: {
              type: 'CUP_KNOCKOUT',
              parentCup: input.kempesCupId,
              cupType: 'SILVER',
            } as unknown as Prisma.InputJsonValue,
          },
        })

        // 7. Connect silver teams to Copa Plata
        await tx.competition.update({
          where: { id: silverCupCompetition.id },
          data: {
            teams: {
              connect: input.silverTeams.map((t) => ({ id: t.clubId })),
            },
          },
        })

        // 8. Generate Copa Plata matches with proper sourceMatch linking
        const silverTeamIds = input.silverTeams.map(t => t.clubId)
        const silverCreatedMatches = await this.createKnockoutMatchesInTransaction(
          tx,
          silverCupCompetition.id,
          silverTeamIds,
          input.silverTeamPlacements
        )
        silverMatchesCreated = silverCreatedMatches.length
      }

      return {
        success: true,
        goldCup: {
          id: goldCupCompetition.id,
          name: goldCupCompetition.name,
          teamsCount: input.goldTeams.length,
          matchesCreated: goldCreatedMatches.length,
        },
        silverCup: silverCupCompetition
          ? {
              id: silverCupCompetition.id,
              name: silverCupCompetition.name,
              teamsCount: input.silverTeams.length,
              matchesCreated: silverMatchesCreated,
            }
          : null,
      }
    }, {
      timeout: 60000,
    })

    return result
  }

  /**
   * Crea matches de knockout dentro de una transacción con sourceMatch linking correcto.
   * Maneja BYEs propagando equipos directamente a la siguiente ronda.
   * Mismo patrón que createDirectKnockoutMatchesInTransaction de competitions.service.ts.
   */
  private async createKnockoutMatchesInTransaction(
    tx: Prisma.TransactionClient,
    competitionId: string,
    teamIds: string[],
    teamPlacements?: BracketTeamPlacement[]
  ) {
    const bracketResult = generateDirectKnockoutBracket(competitionId, teamIds, teamPlacements)
    const { matchesByRound, roundOrder, startRoundIndex } = bracketResult

    const matchIdMap = new Map<string, string>()
    const byeTeamMap = new Map<string, string>()
    const createdMatches: any[] = []

    for (let roundIdx = startRoundIndex; roundIdx < roundOrder.length; roundIdx++) {
      const currentRound = roundOrder[roundIdx]
      const roundMatches = matchesByRound.get(currentRound) || []
      const isFirstRound = roundIdx === startRoundIndex

      for (const bracketMatch of roundMatches) {
        const { match, round, position, isBye, byeTeamId } = bracketMatch
        const key = `${round}_${position}`

        const cleanedMatch: any = { ...match }
        if (!cleanedMatch.homeClub) delete cleanedMatch.homeClub
        if (!cleanedMatch.awayClub) delete cleanedMatch.awayClub

        if (!isFirstRound) {
          const prevRound = roundOrder[roundIdx - 1]
          const homeSourcePosition = position * 2 - 1
          const awaySourcePosition = position * 2

          const homeSourceKey = `${prevRound}_${homeSourcePosition}`
          const awaySourceKey = `${prevRound}_${awaySourcePosition}`

          const homeSourceMatchId = matchIdMap.get(homeSourceKey)
          const awaySourceMatchId = matchIdMap.get(awaySourceKey)

          const homeByeTeamId = byeTeamMap.get(homeSourceKey)
          const awayByeTeamId = byeTeamMap.get(awaySourceKey)

          if (homeByeTeamId) {
            cleanedMatch.homeClub = { connect: { id: homeByeTeamId } }
            cleanedMatch.homePlaceholder = null
          } else if (homeSourceMatchId) {
            cleanedMatch.homeSourceMatch = { connect: { id: homeSourceMatchId } }
            cleanedMatch.homeSourcePosition = 'WINNER'
          }

          if (awayByeTeamId) {
            cleanedMatch.awayClub = { connect: { id: awayByeTeamId } }
            cleanedMatch.awayPlaceholder = null
          } else if (awaySourceMatchId) {
            cleanedMatch.awaySourceMatch = { connect: { id: awaySourceMatchId } }
            cleanedMatch.awaySourcePosition = 'WINNER'
          }
        }

        const createdMatch = await tx.match.create({ data: cleanedMatch })
        matchIdMap.set(key, createdMatch.id)
        createdMatches.push(createdMatch)

        if (isBye && byeTeamId) {
          byeTeamMap.set(key, byeTeamId)
        }
      }
    }

    return createdMatches
  }

  // ===================== REASSIGN GROUPS =====================

  /**
   * Reasigna los grupos de una Copa Kempes (solo si ningún partido fue jugado)
   * Borra los matches existentes y regenera con las nuevas asignaciones
   */
  async reassignKempesCupGroups(
    competitionId: string,
    groups: Array<{ groupName: string; clubIds: string[] }>
  ) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        matches: true,
        competitionType: true,
      },
    })

    if (!competition) {
      throw new CompetitionNotFoundError()
    }

    // Verificar que TODOS los partidos están PENDIENTES
    const playedMatches = competition.matches.filter(
      (m) => m.status !== MatchStatus.PENDIENTE
    )

    if (playedMatches.length > 0) {
      throw new Error(
        `Cannot reassign groups: ${playedMatches.length} match(es) have already been played or finalized`
      )
    }

    // Ejecutar en transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Borrar todos los matches existentes
      await tx.match.deleteMany({
        where: { competitionId },
      })

      // 2. Desconectar equipos actuales y conectar los nuevos
      const allClubIds = groups.flatMap((g) => g.clubIds)

      await tx.competition.update({
        where: { id: competitionId },
        data: {
          teams: { set: [] }, // Desconectar todos
        },
      })

      await tx.competition.update({
        where: { id: competitionId },
        data: {
          teams: {
            connect: allClubIds.map((id) => ({ id })),
          },
        },
      })

      // 3. Regenerar fixtures de fase de grupos
      const allMatches: Prisma.MatchCreateInput[] = []

      for (const group of groups) {
        const groupMatches = generateGroupStageFixture(
          group.clubIds,
          competitionId,
          group.groupName
        )
        allMatches.push(...groupMatches)
      }

      // 4. Crear los nuevos matches
      for (const matchData of allMatches) {
        await tx.match.create({ data: matchData })
      }

      return {
        success: true,
        competitionId,
        groupsCount: groups.length,
        matchesCreated: allMatches.length,
        teamsTotal: allClubIds.length,
      }
    }, { timeout: 30000 })

    return result
  }

  // ===================== QUERIES =====================

  async getKnockoutBracket(competitionId: string) {
    return await this.fixtureRepository.getKnockoutBracket(competitionId)
  }

  async getCompetitionMatches(competitionId: string) {
    return await this.fixtureRepository.getMatchesByCompetition(competitionId)
  }

  async getMatchById(matchId: string) {
    const match = await this.fixtureRepository.findById(matchId)
    if (!match) {
      throw new Error('Match not found')
    }
    return match
  }

  /**
   * Obtiene partidos filtrados por temporada y/o competición
   * Devuelve MatchDetailedDTO con información de competencia para filtrado en frontend
   */
  async getMatchesWithFilters(seasonId?: string, competitionId?: string) {
    const matches = await this.fixtureRepository.getMatchesWithFilters(seasonId, competitionId)
    return MatchMapper.toDetailedDTOArray(matches as any)
  }

  /**
   * Sortea 3 jugadores por equipo para COVID (solo partidos SENIOR/MAYORES)
   * Se ejecuta automáticamente al crear los fixtures de liga
   */
  async generateMatchCovids(matchId: string, homeClubId: string, awayClubId: string) {
    // Obtener jugadores activos del equipo local (actualClub = homeClub)
    const homePlayers = await this.fixtureRepository.getActivePlayers(homeClubId)

    // Obtener jugadores activos del equipo visitante
    const awayPlayers = await this.fixtureRepository.getActivePlayers(awayClubId)

    // Sortear 3 jugadores por equipo
    const homeCovidPlayers = this.shuffleArray(homePlayers).slice(0, 3)
    const awayCovidPlayers = this.shuffleArray(awayPlayers).slice(0, 3)

    // Guardar en la base de datos
    const covidRecords = [
      ...homeCovidPlayers.map(player => ({
        matchId,
        playerId: player.id,
        clubId: homeClubId
      })),
      ...awayCovidPlayers.map(player => ({
        matchId,
        playerId: player.id,
        clubId: awayClubId
      }))
    ]

    await this.fixtureRepository.createCovidRecords(covidRecords)

    return covidRecords
  }

  /**
   * Obtiene los jugadores COVID de un partido
   */
  async getMatchCovids(matchId: string) {
    const match = await this.fixtureRepository.findById(matchId)
    if (!match) {
      throw new Error('Match not found')
    }

    const covids = await this.fixtureRepository.getMatchCovids(matchId)

    // Separar por equipo
    const homeTeamCovids = covids
      .filter(c => c.clubId === match.homeClubId)
      .map(c => ({
        id: c.player.id,
        fullName: c.player.fullName,
        overall: c.player.overall
      }))

    const awayTeamCovids = covids
      .filter(c => c.clubId === match.awayClubId)
      .map(c => ({
        id: c.player.id,
        fullName: c.player.fullName,
        overall: c.player.overall
      }))

    return {
      matchId,
      homeTeamCovids,
      awayTeamCovids
    }
  }

  // ===================== SUBMIT RESULT =====================

  /**
   * Get pending matches for the authenticated user's club
   */
  async getMyPendingMatches(userId: string) {
    const club = await this.fixtureRepository.findClubByUserId(userId)
    if (!club) {
      return []
    }

    const matches = await this.fixtureRepository.findPendingMatchesByClubId(club.id)

    return matches.map((match: any) => ({
      id: match.id,
      matchdayOrder: match.matchdayOrder,
      status: match.status,
      stage: match.stage,
      knockoutRound: match.knockoutRound,
      homeClub: {
        id: match.homeClub.id,
        name: match.homeClub.name,
        logo: match.homeClub.logo,
      },
      awayClub: {
        id: match.awayClub.id,
        name: match.awayClub.name,
        logo: match.awayClub.logo,
      },
      competition: {
        id: match.competition.id,
        name: match.competition.name,
        competitionType: {
          id: match.competition.competitionType.id,
          name: match.competition.competitionType.name,
          category: match.competition.competitionType.category,
          format: match.competition.competitionType.format,
          hierarchy: match.competition.competitionType.hierarchy,
        },
      },
      isUserHome: match.homeClubId === club.id,
    }))
  }

  /**
   * Submit a match result with events, MVP, and auto-propagate knockout dependencies.
   * Everything runs in a single transaction.
   */
  async submitResult(input: SubmitResultInput) {
    // Use lightweight query (no sourceMatch sub-includes) that also fetches dependent matches
    const match = await this.fixtureRepository.findByIdForSubmit(input.matchId)
    if (!match) {
      throw new MatchNotFoundError()
    }

    if (match.status === MatchStatus.FINALIZADO) {
      throw new MatchAlreadyFinalizedError()
    }

    if (!match.homeClubId || !match.awayClubId) {
      throw new MatchNotAssignedError()
    }

    // Parallel: verify user + fetch event types in one go
    const [userClub, eventTypes] = await Promise.all([
      this.fixtureRepository.findClubByUserId(input.userId),
      this.prisma.eventType.findMany({ where: { name: { in: ['GOAL', 'MVP'] } } }),
    ])

    if (!userClub || (userClub.id !== match.homeClubId && userClub.id !== match.awayClubId)) {
      throw new UserNotClubOwnerError()
    }

    // Knockout matches cannot draw EXCEPT for LIGUILLA (round-robin mini-league)
    if (
      match.stage === CompetitionStage.KNOCKOUT &&
      input.homeClubGoals === input.awayClubGoals &&
      match.knockoutRound !== KnockoutRound.LIGUILLA
    ) {
      throw new KnockoutMatchDrawError()
    }

    // MVP is required
    if (!input.mvpPlayerId) {
      throw new MvpRequiredError()
    }

    // Validate goal events + own goals match scores
    const goalEventType = eventTypes.find((et) => et.name === 'GOAL')
    const mvpEventType = eventTypes.find((et) => et.name === 'MVP')

    if (goalEventType) {
      const homeGoalSum = input.homeEvents
        .filter((e) => e.typeId === goalEventType.id)
        .reduce((sum, e) => sum + e.quantity, 0)
      const awayGoalSum = input.awayEvents
        .filter((e) => e.typeId === goalEventType.id)
        .reduce((sum, e) => sum + e.quantity, 0)

      const homeTotalGoals = homeGoalSum + (input.homeOwnGoals || 0)
      const awayTotalGoals = awayGoalSum + (input.awayOwnGoals || 0)

      if (homeTotalGoals !== input.homeClubGoals) {
        throw new GoalEventsMismatchError('home', input.homeClubGoals, homeTotalGoals)
      }
      if (awayTotalGoals !== input.awayClubGoals) {
        throw new GoalEventsMismatchError('away', input.awayClubGoals, awayTotalGoals)
      }
    }

    // Execute everything in a transaction
    const updatedMatch = await this.prisma.$transaction(async (tx) => {
      // 1. Update match status and scores
      const updated = await tx.match.update({
        where: { id: input.matchId },
        data: {
          homeClubGoals: input.homeClubGoals,
          awayClubGoals: input.awayClubGoals,
          homeOwnGoals: input.homeOwnGoals || 0,
          awayOwnGoals: input.awayOwnGoals || 0,
          status: MatchStatus.FINALIZADO,
          resultRecordedAt: new Date(),
        },
        include: {
          homeClub: true,
          awayClub: true,
          competition: true,
        },
      })

      // 2. Build flat array of all event records and batch insert
      const eventRecords: { typeId: string; playerId: string; matchId: string }[] = []

      for (const event of input.homeEvents) {
        for (let i = 0; i < event.quantity; i++) {
          eventRecords.push({ typeId: event.typeId, playerId: event.playerId, matchId: input.matchId })
        }
      }

      for (const event of input.awayEvents) {
        for (let i = 0; i < event.quantity; i++) {
          eventRecords.push({ typeId: event.typeId, playerId: event.playerId, matchId: input.matchId })
        }
      }

      if (mvpEventType) {
        eventRecords.push({ typeId: mvpEventType.id, playerId: input.mvpPlayerId, matchId: input.matchId })
      }

      await tx.event.createMany({ data: eventRecords })

      return updated
    }, { timeout: 15000 })

    // Post-transaction: propagate knockout dependencies
    // Reuse dependent matches already fetched by findByIdForSubmit (no extra query)
    const winnerId = input.homeClubGoals > input.awayClubGoals ? match.homeClubId : match.awayClubId
    const loserId = input.homeClubGoals > input.awayClubGoals ? match.awayClubId : match.homeClubId

    const dependentMatches = [
      ...((match as any).homeNextMatches || []),
      ...((match as any).dependentMatches || []),
    ]
    let dependentMatchesUpdated = 0

    for (const nextMatch of dependentMatches) {
      const updateData: Prisma.MatchUpdateInput = {}

      if (nextMatch.homeSourceMatchId === input.matchId) {
        updateData.homeClub = {
          connect: { id: nextMatch.homeSourcePosition === 'WINNER' ? winnerId : loserId },
        }
        updateData.homePlaceholder = null
      }

      if (nextMatch.awaySourceMatchId === input.matchId) {
        updateData.awayClub = {
          connect: { id: nextMatch.awaySourcePosition === 'WINNER' ? winnerId : loserId },
        }
        updateData.awayPlaceholder = null
      }

      if (Object.keys(updateData).length > 0) {
        await this.fixtureRepository.updateMatch(nextMatch.id, updateData)
        dependentMatchesUpdated++
      }
    }

    // Refresh standings snapshot (fire-and-forget)
    this.standingsService.refreshStandingsSnapshot(match.competitionId).catch((err) => {
      console.error('Error refreshing standings snapshot:', err)
    })

    return {
      success: true,
      match: updatedMatch,
      dependentMatchesUpdated,
    }
  }

  /**
   * Get match detail with raw events for admin edit form pre-population.
   * Events are aggregated back into {typeId, playerId, quantity} format grouped by home/away.
   */
  async getMatchDetailForEdit(matchId: string) {
    const match = await this.fixtureRepository.findByIdWithRawEvents(matchId)
    if (!match) throw new MatchNotFoundError()

    // Aggregate events into EventRow format grouped by home/away
    const homeEvents: { typeId: string; playerId: string; quantity: number }[] = []
    const awayEvents: { typeId: string; playerId: string; quantity: number }[] = []
    let mvpPlayerId: string | null = null

    const eventMap = new Map<string, { typeId: string; playerId: string; count: number; side: 'home' | 'away' }>()

    for (const event of (match as any).events || []) {
      if (event.type.name === 'MVP') {
        mvpPlayerId = event.playerId
        continue
      }
      const side = event.player.actualClubId === match.homeClubId ? 'home' : 'away'
      const key = `${side}_${event.typeId}_${event.playerId}`
      if (!eventMap.has(key)) {
        eventMap.set(key, { typeId: event.typeId, playerId: event.playerId, count: 0, side })
      }
      eventMap.get(key)!.count++
    }

    for (const entry of eventMap.values()) {
      const row = { typeId: entry.typeId, playerId: entry.playerId, quantity: entry.count }
      if (entry.side === 'home') homeEvents.push(row)
      else awayEvents.push(row)
    }

    return {
      id: match.id,
      matchdayOrder: match.matchdayOrder,
      status: match.status,
      stage: match.stage,
      knockoutRound: (match as any).knockoutRound || null,
      homeClubGoals: match.homeClubGoals,
      awayClubGoals: match.awayClubGoals,
      homeOwnGoals: match.homeOwnGoals,
      awayOwnGoals: match.awayOwnGoals,
      homeClub: match.homeClub
        ? { id: match.homeClub.id, name: match.homeClub.name, logo: match.homeClub.logo }
        : null,
      awayClub: match.awayClub
        ? { id: match.awayClub.id, name: match.awayClub.name, logo: match.awayClub.logo }
        : null,
      competition: {
        id: (match as any).competition.id,
        name: (match as any).competition.name,
        competitionType: {
          id: (match as any).competition.competitionType.id,
          name: (match as any).competition.competitionType.name,
          category: (match as any).competition.competitionType.category,
          format: (match as any).competition.competitionType.format,
          hierarchy: (match as any).competition.competitionType.hierarchy,
        },
      },
      homeEvents,
      awayEvents,
      mvpPlayerId,
    }
  }

  /**
   * Admin edit/submit result. Bypasses club ownership.
   * Supports changing status to FINALIZADO, PENDIENTE, or CANCELADO.
   */
  async adminEditResult(input: AdminEditResultInput) {
    const match = await this.fixtureRepository.findByIdForSubmit(input.matchId)
    if (!match) throw new MatchNotFoundError()
    if (!match.homeClubId || !match.awayClubId) throw new MatchNotAssignedError()

    const isFinalizing = input.newStatus === 'FINALIZADO'

    // Validations only when finalizing
    if (isFinalizing) {
      // Knockout draw check
      if (
        match.stage === CompetitionStage.KNOCKOUT &&
        input.homeClubGoals === input.awayClubGoals &&
        (match as any).knockoutRound !== KnockoutRound.LIGUILLA
      ) {
        throw new KnockoutMatchDrawError()
      }

      if (!input.mvpPlayerId) throw new MvpRequiredError()

      // Validate goal events + own goals match scores
      const eventTypes = await this.prisma.eventType.findMany({ where: { name: { in: ['GOAL', 'MVP'] } } })
      const goalEventType = eventTypes.find((et) => et.name === 'GOAL')

      if (goalEventType) {
        const homeGoalSum = input.homeEvents
          .filter((e) => e.typeId === goalEventType.id)
          .reduce((sum, e) => sum + e.quantity, 0)
        const awayGoalSum = input.awayEvents
          .filter((e) => e.typeId === goalEventType.id)
          .reduce((sum, e) => sum + e.quantity, 0)

        const homeTotalGoals = homeGoalSum + (input.homeOwnGoals || 0)
        const awayTotalGoals = awayGoalSum + (input.awayOwnGoals || 0)

        if (homeTotalGoals !== input.homeClubGoals) {
          throw new GoalEventsMismatchError('home', input.homeClubGoals, homeTotalGoals)
        }
        if (awayTotalGoals !== input.awayClubGoals) {
          throw new GoalEventsMismatchError('away', input.awayClubGoals, awayTotalGoals)
        }
      }
    }

    // Transaction: delete old events, update match, create new events (if finalizing)
    const updatedMatch = await this.prisma.$transaction(async (tx) => {
      // 1. Delete existing events
      await tx.event.deleteMany({ where: { matchId: input.matchId } })

      // 2. Determine update data based on target status
      const updateData: any = {
        status: input.newStatus as MatchStatus,
      }

      if (isFinalizing) {
        updateData.homeClubGoals = input.homeClubGoals
        updateData.awayClubGoals = input.awayClubGoals
        updateData.homeOwnGoals = input.homeOwnGoals || 0
        updateData.awayOwnGoals = input.awayOwnGoals || 0
        updateData.resultRecordedAt = new Date()
      } else {
        // PENDIENTE or CANCELADO: reset scores
        updateData.homeClubGoals = 0
        updateData.awayClubGoals = 0
        updateData.homeOwnGoals = 0
        updateData.awayOwnGoals = 0
        updateData.resultRecordedAt = null
      }

      const updated = await tx.match.update({
        where: { id: input.matchId },
        data: updateData,
        include: { homeClub: true, awayClub: true, competition: true },
      })

      // 3. Create new events only when finalizing
      if (isFinalizing) {
        const eventRecords: { typeId: string; playerId: string; matchId: string }[] = []

        for (const event of input.homeEvents) {
          for (let i = 0; i < event.quantity; i++) {
            eventRecords.push({ typeId: event.typeId, playerId: event.playerId, matchId: input.matchId })
          }
        }
        for (const event of input.awayEvents) {
          for (let i = 0; i < event.quantity; i++) {
            eventRecords.push({ typeId: event.typeId, playerId: event.playerId, matchId: input.matchId })
          }
        }

        // MVP event
        const mvpEventType = await tx.eventType.findFirst({ where: { name: 'MVP' } })
        if (mvpEventType && input.mvpPlayerId) {
          eventRecords.push({ typeId: mvpEventType.id, playerId: input.mvpPlayerId, matchId: input.matchId })
        }

        if (eventRecords.length > 0) {
          await tx.event.createMany({ data: eventRecords })
        }
      }

      return updated
    }, { timeout: 15000 })

    // Post-transaction: propagate knockout dependencies only when finalizing
    if (isFinalizing) {
      const winnerId = input.homeClubGoals > input.awayClubGoals ? match.homeClubId : match.awayClubId
      const loserId = input.homeClubGoals > input.awayClubGoals ? match.awayClubId : match.homeClubId

      const dependentMatches = [
        ...((match as any).homeNextMatches || []),
        ...((match as any).dependentMatches || []),
      ]

      for (const nextMatch of dependentMatches) {
        const updateData: Prisma.MatchUpdateInput = {}

        if (nextMatch.homeSourceMatchId === input.matchId) {
          updateData.homeClub = {
            connect: { id: nextMatch.homeSourcePosition === 'WINNER' ? winnerId : loserId },
          }
          updateData.homePlaceholder = null
        }

        if (nextMatch.awaySourceMatchId === input.matchId) {
          updateData.awayClub = {
            connect: { id: nextMatch.awaySourcePosition === 'WINNER' ? winnerId : loserId },
          }
          updateData.awayPlaceholder = null
        }

        if (Object.keys(updateData).length > 0) {
          await this.fixtureRepository.updateMatch(nextMatch.id, updateData)
        }
      }
    }

    // Refresh standings
    this.standingsService.refreshStandingsSnapshot(match.competitionId).catch((err) => {
      console.error('Error refreshing standings snapshot:', err)
    })

    return { success: true, match: updatedMatch }
  }

  /**
   * Función auxiliar para mezclar array (Fisher-Yates shuffle)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}
