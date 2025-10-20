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
} from '@/features/utils/types'
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
  constructor(
    private fixtureRepository: FixtureRepository,
    private competitionRepository: CompetitionRepository
  ) {}

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
}
