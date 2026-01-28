import { FixtureService } from '../fixtures.service'
import { FixtureRepository } from '../fixtures.repository'
import { CompetitionRepository } from '../../competitions/competitions.repository'
import { MatchStatus, CompetitionStage, Match, Competition } from '@prisma/client'
import {
  MatchNotFoundError,
  MatchAlreadyFinalizedError,
  MatchNotAssignedError,
  KnockoutMatchDrawError,
} from '../fixtures.errors'
import { CompetitionNotFoundError } from '../../competitions/competitions.errors'
import { FinishMatchInput } from '@/types'

const mockFixtureRepository: jest.Mocked<FixtureRepository> = {
  findById: jest.fn(),
  updateMatch: jest.fn(),
  createMatch: jest.fn(),
  findByCompetitionId: jest.fn(),
  findMatchesDependingOn: jest.fn(),
} as any

const mockCompetitionRepository: jest.Mocked<CompetitionRepository> = {
  findOneById: jest.fn(),
} as any

describe('FixtureService - Operaciones Básicas', () => {
  let fixtureService: FixtureService

  beforeEach(() => {
    jest.clearAllMocks()
    fixtureService = new FixtureService({
      fixtureRepository: mockFixtureRepository,
      competitionRepository: mockCompetitionRepository,
    })
  })

  describe('finishMatch', () => {
    it('debería finalizar un partido correctamente', async () => {
      const mockMatch: Match = {
        id: 'match-1',
        homeClubId: 'club-1',
        awayClubId: 'club-2',
        homeClubGoals: 0,
        awayClubGoals: 0,
        homePlaceholder: null,
        awayPlaceholder: null,
        status: MatchStatus.PENDIENTE,
        stage: CompetitionStage.ROUND_ROBIN,
        knockoutRound: null,
        competitionId: 'comp-1',
        matchdayOrder: 1,
        homeSourceMatchId: null,
        awaySourceMatchId: null,
        homeSourcePosition: null,
        awaySourcePosition: null,
      }

      const input: FinishMatchInput = {
        matchId: 'match-1',
        homeClubGoals: 2,
        awayClubGoals: 1,
      }

      const updatedMatch: Match = {
        ...mockMatch,
        homeClubGoals: 2,
        awayClubGoals: 1,
        status: MatchStatus.FINALIZADO,
      }

      mockFixtureRepository.findById.mockResolvedValue(mockMatch)
      mockFixtureRepository.updateMatch.mockResolvedValue(updatedMatch)
      mockFixtureRepository.findMatchesDependingOn.mockResolvedValue([])

      const result = await fixtureService.finishMatch(input)

      expect(mockFixtureRepository.findById).toHaveBeenCalledWith('match-1')
      expect(mockFixtureRepository.updateMatch).toHaveBeenCalledWith('match-1', {
        homeClubGoals: 2,
        awayClubGoals: 1,
        status: MatchStatus.FINALIZADO,
      })
      expect(result).toBeDefined()
    })

    it('debería lanzar MatchNotFoundError si el partido no existe', async () => {
      const input: FinishMatchInput = {
        matchId: 'match-999',
        homeClubGoals: 2,
        awayClubGoals: 1,
      }

      mockFixtureRepository.findById.mockResolvedValue(null)

      await expect(fixtureService.finishMatch(input)).rejects.toThrow(MatchNotFoundError)
    })

    it('debería lanzar MatchAlreadyFinalizedError si el partido ya está finalizado', async () => {
      const mockMatch: Match = {
        id: 'match-1',
        homeClubId: 'club-1',
        awayClubId: 'club-2',
        homeClubGoals: 2,
        awayClubGoals: 1,
        homePlaceholder: null,
        awayPlaceholder: null,
        status: MatchStatus.FINALIZADO,
        stage: CompetitionStage.ROUND_ROBIN,
        competitionId: 'comp-1',
        matchdayOrder: 1,
        knockoutRound: null,
        homeSourceMatchId: null,
        awaySourceMatchId: null,
        homeSourcePosition: null,
        awaySourcePosition: null,
      }

      const input: FinishMatchInput = {
        matchId: 'match-1',
        homeClubGoals: 3,
        awayClubGoals: 2,
      }

      mockFixtureRepository.findById.mockResolvedValue(mockMatch)

      await expect(fixtureService.finishMatch(input)).rejects.toThrow(MatchAlreadyFinalizedError)
    })

    it('debería lanzar MatchNotAssignedError si faltan equipos', async () => {
      const mockMatch: Match = {
        id: 'match-1',
        homeClubId: null,
        awayClubId: null,
        homeClubGoals: 0,
        awayClubGoals: 0,
        homePlaceholder: 'Ganador Semi 1',
        awayPlaceholder: 'Ganador Semi 2',
        status: MatchStatus.PENDIENTE,
        stage: CompetitionStage.KNOCKOUT,
        competitionId: 'comp-1',
        matchdayOrder: 0,
        knockoutRound: 'FINAL' as any,
        homeSourceMatchId: 'semi-1',
        awaySourceMatchId: 'semi-2',
        homeSourcePosition: 'WINNER',
        awaySourcePosition: 'WINNER',
      }

      const input: FinishMatchInput = {
        matchId: 'match-1',
        homeClubGoals: 2,
        awayClubGoals: 1,
      }

      mockFixtureRepository.findById.mockResolvedValue(mockMatch)

      await expect(fixtureService.finishMatch(input)).rejects.toThrow(MatchNotAssignedError)
    })

    it('debería lanzar KnockoutMatchDrawError si es knockout y hay empate', async () => {
      const mockMatch: Match = {
        id: 'match-1',
        homeClubId: 'club-1',
        awayClubId: 'club-2',
        homeClubGoals: 0,
        awayClubGoals: 0,
        homePlaceholder: null,
        awayPlaceholder: null,
        status: MatchStatus.PENDIENTE,
        stage: CompetitionStage.KNOCKOUT,
        competitionId: 'comp-1',
        matchdayOrder: 0,
        knockoutRound: 'SEMIFINAL' as any,
        homeSourceMatchId: null,
        awaySourceMatchId: null,
        homeSourcePosition: null,
        awaySourcePosition: null,
      }

      const input: FinishMatchInput = {
        matchId: 'match-1',
        homeClubGoals: 2,
        awayClubGoals: 2,
      }

      mockFixtureRepository.findById.mockResolvedValue(mockMatch)

      await expect(fixtureService.finishMatch(input)).rejects.toThrow(KnockoutMatchDrawError)
    })
  })

  describe('createKnockoutFixture', () => {
    it('debería lanzar CompetitionNotFoundError si la competición no existe', async () => {
      const input = {
        competitionId: 'comp-999',
        brackets: [],
      }

      mockCompetitionRepository.findOneById.mockResolvedValue(null)

      await expect(fixtureService.createKnockoutFixture(input)).rejects.toThrow(CompetitionNotFoundError)
    })

    it('debería crear fixtures de knockout exitosamente', async () => {
      const mockCompetition: Competition = {
        id: 'comp-1',
        name: 'Copa Kempes - T1',
        competitionTypeId: 'type-1',
        seasonId: 'season-1',
        system: 'KNOCKOUT' as any,
        isActive: true,
        parentCompetitionId: null,
        rules: {},
      }

      const input = {
        competitionId: 'comp-1',
        brackets: [
          {
            round: 'FINAL' as const,
            position: 1,
            homeTeam: {
              type: 'DIRECT' as const,
              clubId: 'club-1',
            },
            awayTeam: {
              type: 'DIRECT' as const,
              clubId: 'club-2',
            },
          },
        ],
      }

      const createdMatch: Match = {
        id: 'match-1',
        homeClubId: 'club-1',
        awayClubId: 'club-2',
        homeClubGoals: 0,
        awayClubGoals: 0,
        homePlaceholder: null,
        awayPlaceholder: null,
        status: MatchStatus.PENDIENTE,
        stage: CompetitionStage.KNOCKOUT,
        competitionId: 'comp-1',
        matchdayOrder: 0,
        knockoutRound: 'FINAL' as any,
        homeSourceMatchId: null,
        awaySourceMatchId: null,
        homeSourcePosition: null,
        awaySourcePosition: null,
      }

      mockCompetitionRepository.findOneById.mockResolvedValue(mockCompetition)
      mockFixtureRepository.createMatch.mockResolvedValue(createdMatch)

      const result = await fixtureService.createKnockoutFixture(input)

      expect(result.success).toBe(true)
      expect(result.competitionId).toBe('comp-1')
      expect(result.matchesCreated).toBe(1)
    })
  })
})
