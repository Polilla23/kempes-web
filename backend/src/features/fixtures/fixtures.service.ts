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
import { generateLeagueFixture, generateGroupStageFixture, generateDirectKnockoutBracket } from '@/features/utils/generateFixture'
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
import { SubmitResultInput } from '@/types'
import { StandingsService } from '@/features/seasons/standings.service'

// Type for bracket input from admin
type BracketInput = {
  round: number
  position: number
  homeTeamId?: string
  awayTeamId?: string
  isBye?: boolean
}

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
   * Genera Copa Oro y Copa Plata a partir de los equipos clasificados de Copa Kempes
   * El admin define los cruces manualmente
   */
  async generateGoldSilverCups(input: {
    kempesCupId: string
    goldTeams: QualifiedTeam[]
    silverTeams: QualifiedTeam[]
    goldBrackets: BracketInput[]
    silverBrackets: BracketInput[]
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

      // 4. Generate Copa Oro matches from brackets
      const goldMatches = this.generateKnockoutMatchesFromBrackets(
        goldCupCompetition.id,
        input.goldBrackets,
        input.goldTeams
      )

      for (const matchData of goldMatches) {
        await tx.match.create({ data: matchData })
      }

      // 5. Find or create SILVER_CUP CompetitionType (if there are silver teams)
      let silverCupCompetition = null
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

        // 8. Generate Copa Plata matches from brackets
        const silverMatches = this.generateKnockoutMatchesFromBrackets(
          silverCupCompetition.id,
          input.silverBrackets,
          input.silverTeams
        )

        for (const matchData of silverMatches) {
          await tx.match.create({ data: matchData })
        }
      }

      return {
        success: true,
        goldCup: {
          id: goldCupCompetition.id,
          name: goldCupCompetition.name,
          teamsCount: input.goldTeams.length,
          matchesCreated: goldMatches.length,
        },
        silverCup: silverCupCompetition
          ? {
              id: silverCupCompetition.id,
              name: silverCupCompetition.name,
              teamsCount: input.silverTeams.length,
              matchesCreated: input.silverBrackets.length,
            }
          : null,
      }
    }, {
      timeout: 60000,
    })

    return result
  }

  /**
   * Genera los matches de knockout a partir de los brackets definidos por el admin
   * Los byes se marcan con homeClub o awayClub vacío, y el equipo con bye pasa directo
   */
  private generateKnockoutMatchesFromBrackets(
    competitionId: string,
    brackets: BracketInput[],
    teams: QualifiedTeam[]
  ): Prisma.MatchCreateInput[] {
    const matches: Prisma.MatchCreateInput[] = []

    // Determine knockout round based on round number
    const getKnockoutRound = (round: number, totalRounds: number): KnockoutRound => {
      const roundsFromFinal = totalRounds - round
      switch (roundsFromFinal) {
        case 0:
          return KnockoutRound.FINAL
        case 1:
          return KnockoutRound.SEMIFINAL
        case 2:
          return KnockoutRound.QUARTERFINAL
        case 3:
          return KnockoutRound.ROUND_OF_16
        case 4:
          return KnockoutRound.ROUND_OF_32
        default:
          return KnockoutRound.ROUND_OF_64
      }
    }

    // Calculate total rounds based on bracket positions
    const maxRound = Math.max(...brackets.map((b) => b.round))

    // Group brackets by round for dependency tracking
    const bracketsByRound = new Map<number, BracketInput[]>()
    brackets.forEach((b) => {
      if (!bracketsByRound.has(b.round)) {
        bracketsByRound.set(b.round, [])
      }
      bracketsByRound.get(b.round)!.push(b)
    })

    // Sort rounds
    const rounds = Array.from(bracketsByRound.keys()).sort((a, b) => a - b)

    for (const round of rounds) {
      const roundBrackets = bracketsByRound.get(round)!
      roundBrackets.sort((a, b) => a.position - b.position)

      for (const bracket of roundBrackets) {
        const knockoutRound = getKnockoutRound(round, maxRound)

        // Build placeholder text based on previous round matches
        let homePlaceholder: string | undefined
        let awayPlaceholder: string | undefined

        if (round > 1) {
          // Link to previous round matches (winner of match X)
          const prevPos1 = bracket.position * 2 - 1
          const prevPos2 = bracket.position * 2

          homePlaceholder = `Ganador P${prevPos1}`
          awayPlaceholder = `Ganador P${prevPos2}`
        }

        const matchData: Prisma.MatchCreateInput = {
          competition: { connect: { id: competitionId } },
          status: MatchStatus.PENDIENTE,
          stage: CompetitionStage.KNOCKOUT,
          knockoutRound,
          matchdayOrder: round, // matchdayOrder corresponds to round for knockout
        }

        // If home team is assigned (not a bye, not waiting for previous match)
        if (bracket.homeTeamId) {
          matchData.homeClub = { connect: { id: bracket.homeTeamId } }
        } else if (homePlaceholder) {
          matchData.homePlaceholder = homePlaceholder
        }

        // If away team is assigned (not a bye, not waiting for previous match)
        if (bracket.awayTeamId) {
          matchData.awayClub = { connect: { id: bracket.awayTeamId } }
        } else if (awayPlaceholder) {
          matchData.awayPlaceholder = awayPlaceholder
        }

        // Handle bye case - if one team is assigned and the other is a bye,
        // this match is effectively already decided (team with bye advances)
        if (bracket.isBye) {
          // Mark as a bye match - will be handled specially
          // The team assigned advances automatically
          matchData.status = MatchStatus.PENDIENTE // Still pending until processed
        }

        matches.push(matchData)
      }
    }

    return matches
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
        name: c.player.name,
        lastName: c.player.lastName,
        overall: c.player.overall
      }))

    const awayTeamCovids = covids
      .filter(c => c.clubId === match.awayClubId)
      .map(c => ({
        id: c.player.id,
        name: c.player.name,
        lastName: c.player.lastName,
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
    const match = await this.fixtureRepository.findById(input.matchId)
    if (!match) {
      throw new MatchNotFoundError()
    }

    if (match.status === MatchStatus.FINALIZADO) {
      throw new MatchAlreadyFinalizedError()
    }

    if (!match.homeClubId || !match.awayClubId) {
      throw new MatchNotAssignedError()
    }

    // Verify user owns one of the clubs
    const userClub = await this.fixtureRepository.findClubByUserId(input.userId)
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

    // Validate goal events match scores
    const goalEventType = await this.prisma.eventType.findFirst({ where: { name: 'GOAL' } })
    if (goalEventType) {
      const homeGoalSum = input.homeEvents
        .filter((e) => e.typeId === goalEventType.id)
        .reduce((sum, e) => sum + e.quantity, 0)
      const awayGoalSum = input.awayEvents
        .filter((e) => e.typeId === goalEventType.id)
        .reduce((sum, e) => sum + e.quantity, 0)

      if (homeGoalSum !== input.homeClubGoals) {
        throw new GoalEventsMismatchError('home', input.homeClubGoals, homeGoalSum)
      }
      if (awayGoalSum !== input.awayClubGoals) {
        throw new GoalEventsMismatchError('away', input.awayClubGoals, awayGoalSum)
      }
    }

    // Get MVP event type
    const mvpEventType = await this.prisma.eventType.findFirst({ where: { name: 'MVP' } })

    // Execute everything in a transaction
    const updatedMatch = await this.prisma.$transaction(async (tx) => {
      // 1. Update match status and scores
      const updated = await tx.match.update({
        where: { id: input.matchId },
        data: {
          homeClubGoals: input.homeClubGoals,
          awayClubGoals: input.awayClubGoals,
          status: MatchStatus.FINALIZADO,
          resultRecordedAt: new Date(),
        },
        include: {
          homeClub: true,
          awayClub: true,
          competition: true,
        },
      })

      // 2. Create home events (expand quantity into individual records)
      for (const event of input.homeEvents) {
        for (let i = 0; i < event.quantity; i++) {
          await tx.event.create({
            data: {
              type: { connect: { id: event.typeId } },
              player: { connect: { id: event.playerId } },
              match: { connect: { id: input.matchId } },
            },
          })
        }
      }

      // 3. Create away events
      for (const event of input.awayEvents) {
        for (let i = 0; i < event.quantity; i++) {
          await tx.event.create({
            data: {
              type: { connect: { id: event.typeId } },
              player: { connect: { id: event.playerId } },
              match: { connect: { id: input.matchId } },
            },
          })
        }
      }

      // 4. Create MVP event
      if (mvpEventType) {
        await tx.event.create({
          data: {
            type: { connect: { id: mvpEventType.id } },
            player: { connect: { id: input.mvpPlayerId } },
            match: { connect: { id: input.matchId } },
          },
        })
      }

      return updated
    }, { timeout: 30000 })

    // 5. Post-transaction: propagate knockout dependencies (same logic as finishMatch)
    const winnerId = input.homeClubGoals > input.awayClubGoals ? match.homeClubId : match.awayClubId
    const loserId = input.homeClubGoals > input.awayClubGoals ? match.awayClubId : match.homeClubId

    const dependentMatches = await this.fixtureRepository.findMatchesDependingOn(input.matchId)
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
