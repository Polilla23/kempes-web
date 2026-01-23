import { UserRepository } from '@/features/users/users.repository'
import { UserNotFoundError } from '@/features/users/users.errors'
import { MyAccountRepository } from '@/features/me/me.repository'
import { StandingsService } from '@/features/seasons/standings.service'
import { User } from '@prisma/client'

export class MyAccountService {
  private userRepository: UserRepository
  private myAccountRepository: MyAccountRepository
  private standingsService: StandingsService

  constructor({
    userRepository,
    myAccountRepository,
    standingsService,
  }: {
    userRepository: UserRepository
    myAccountRepository: MyAccountRepository
    standingsService: StandingsService
  }) {
    this.userRepository = userRepository
    this.myAccountRepository = myAccountRepository
    this.standingsService = standingsService
  }

  async getUserData(id: string): Promise<User> {
    const userFound = await this.userRepository.findOneById(id)

    if (!userFound) {
      throw new UserNotFoundError()
    }

    return userFound
  }

  /**
   * Get user's club with full information
   */
  async getUserClub(userId: string) {
    const user = await this.myAccountRepository.getUserWithClub(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    if (!user.club) {
      return null
    }

    return {
      id: user.club.id,
      name: user.club.name,
      logo: user.club.logo,
      isActive: user.club.isActive,
      playersOwned: user.club._count.playerOwner,
      playersActive: user.club._count.playerNow,
      squad: user.club.playerNow,
    }
  }

  /**
   * Get user's current league with standings
   */
  async getUserLeague(userId: string) {
    const user = await this.myAccountRepository.getUserWithClub(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    if (!user.club) {
      return null
    }

    const league = await this.myAccountRepository.getUserLeague(user.club.id)

    if (!league) {
      return null
    }

    // Get standings for this competition
    const standingsData = await this.standingsService.calculateStandings(league.id)

    // Find user's position in standings
    const userPosition = standingsData.standings.find(
      (s: { clubId: string }) => s.clubId === user.club!.id
    )

    return {
      competition: {
        id: league.id,
        name: league.name,
        system: league.system,
        competitionType: {
          id: league.competitionType.id,
          name: league.competitionType.name,
          category: league.competitionType.category,
          hierarchy: league.competitionType.hierarchy,
          format: league.competitionType.format,
        },
        season: {
          id: league.season.id,
          number: league.season.number,
        },
      },
      standings: standingsData.standings,
      userPosition: userPosition
        ? {
            position: userPosition.position,
            points: userPosition.points,
            played: userPosition.played,
            won: userPosition.won,
            drawn: userPosition.drawn,
            lost: userPosition.lost,
            goalsFor: userPosition.goalsFor,
            goalsAgainst: userPosition.goalsAgainst,
            goalDifference: userPosition.goalDifference,
          }
        : null,
      isComplete: standingsData.isComplete,
      matchesPlayed: standingsData.matchesPlayed,
      matchesTotal: standingsData.matchesTotal,
    }
  }

  /**
   * Get recent matches for user's club
   */
  async getUserRecentMatches(userId: string, limit: number = 10) {
    const user = await this.myAccountRepository.getUserWithClub(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    if (!user.club) {
      return []
    }

    const matches = await this.myAccountRepository.getUserRecentMatches(user.club.id, limit)

    return matches.map((match) => ({
      id: match.id,
      matchdayOrder: match.matchdayOrder,
      status: match.status,
      stage: match.stage,
      knockoutRound: match.knockoutRound,
      homeClub: match.homeClub,
      awayClub: match.awayClub,
      homeClubGoals: match.homeClubGoals,
      awayClubGoals: match.awayClubGoals,
      competition: {
        id: match.competition.id,
        name: match.competition.name,
        competitionType: match.competition.competitionType,
      },
      isUserHome: match.homeClubId === user.club!.id,
      result: this.getMatchResult(match, user.club!.id),
    }))
  }

  /**
   * Get upcoming matches for user's club
   */
  async getUserUpcomingMatches(userId: string, limit: number = 5) {
    const user = await this.myAccountRepository.getUserWithClub(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    if (!user.club) {
      return []
    }

    const matches = await this.myAccountRepository.getUserUpcomingMatches(user.club.id, limit)

    return matches.map((match) => ({
      id: match.id,
      matchdayOrder: match.matchdayOrder,
      status: match.status,
      stage: match.stage,
      knockoutRound: match.knockoutRound,
      homeClub: match.homeClub,
      awayClub: match.awayClub,
      competition: {
        id: match.competition.id,
        name: match.competition.name,
        competitionType: match.competition.competitionType,
      },
      isUserHome: match.homeClubId === user.club!.id,
    }))
  }

  /**
   * Get global recent matches (for carousel)
   */
  async getRecentMatches(limit: number = 20) {
    const matches = await this.myAccountRepository.getRecentMatches(limit)

    return matches.map((match) => ({
      id: match.id,
      matchdayOrder: match.matchdayOrder,
      status: match.status,
      stage: match.stage,
      knockoutRound: match.knockoutRound,
      homeClub: match.homeClub,
      awayClub: match.awayClub,
      homeClubGoals: match.homeClubGoals,
      awayClubGoals: match.awayClubGoals,
      competition: {
        id: match.competition.id,
        name: match.competition.name,
        competitionType: match.competition.competitionType,
      },
    }))
  }

  /**
   * Get season statistics for home page
   */
  async getSeasonStats() {
    return await this.myAccountRepository.getSeasonStats()
  }

  /**
   * Helper to determine match result from user's perspective
   */
  private getMatchResult(
    match: { homeClubId: string | null; awayClubId: string | null; homeClubGoals: number; awayClubGoals: number },
    userClubId: string
  ): 'W' | 'D' | 'L' {
    const isHome = match.homeClubId === userClubId
    const userGoals = isHome ? match.homeClubGoals : match.awayClubGoals
    const opponentGoals = isHome ? match.awayClubGoals : match.homeClubGoals

    if (userGoals > opponentGoals) return 'W'
    if (userGoals < opponentGoals) return 'L'
    return 'D'
  }
}
