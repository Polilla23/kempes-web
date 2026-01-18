import { FixtureRepository } from '@/features/fixtures/fixtures.repository'
import { CompetitionRepository } from '@/features/competitions/competitions.repository'
import { MatchStatus, CompetitionStage, Prisma } from '@prisma/client'
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
import { sortBracketsByRound, buildKnockoutMatchData } from '@/features/utils/generateKnockoutFixture'
import { generateLeagueFixture, generateGroupStageFixture } from '@/features/utils/generateFixture'
import { CompetitionNotFoundError } from '@/features/competitions/competitions.errors'
import {
  KnockoutMatchDrawError,
  MatchAlreadyFinalizedError,
  MatchNotAssignedError,
  MatchNotFoundError,
} from '@/features/fixtures/fixtures.errors'

export class FixtureService {
  private fixtureRepository: FixtureRepository
  private competitionRepository: CompetitionRepository

  constructor({
    fixtureRepository,
    competitionRepository,
  }: {
    fixtureRepository: FixtureRepository
    competitionRepository: CompetitionRepository
  }) {
    this.fixtureRepository = fixtureRepository
    this.competitionRepository = competitionRepository
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

    if (match.stage === CompetitionStage.KNOCKOUT && input.homeClubGoals === input.awayClubGoals) {
      throw new KnockoutMatchDrawError() // TODO: Custom error
    }

    const updatedMatch = await this.fixtureRepository.updateMatch(input.matchId, {
      homeClubGoals: input.homeClubGoals,
      awayClubGoals: input.awayClubGoals,
      status: MatchStatus.FINALIZADO, // TODO: Agregar mas detalles (goles, asistencias, tarjetas, etc.)
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
      matchesCreated: created,
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
      matchesCreated: created,
    }
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
   */
  async getMatchesWithFilters(seasonId?: string, competitionId?: string) {
    return await this.fixtureRepository.getMatchesWithFilters(seasonId, competitionId)
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
