import { CompetitionService } from '../competitions.service'
import { ICompetitionRepository, CompetitionWithType } from '../interface/ICompetitionRepository'
import { ICompetitionTypeRepository } from '../../competition-types/interface/ICompetitionTypeRepository'
import { FixtureRepository } from '../../fixtures/fixtures.repository'
import { StandingsService } from '../../seasons/standings.service'
import { Competition, CompetitionType, PrismaClient } from '@prisma/client'
import { CompetitionNotFoundError } from '../competitions.errors'

const mockCompetitionRepository: jest.Mocked<ICompetitionRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOneByIdWithType: jest.fn(),
  findOneBySeasonId: jest.fn(),
  updateOneById: jest.fn(),
  updateIsActive: jest.fn(),
  deleteOneById: jest.fn(),
}

const mockCompetitionTypeRepository: jest.Mocked<ICompetitionTypeRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOneByNameAndCategory: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
}

const mockFixtureRepository = {} as FixtureRepository
const mockStandingsService = {} as StandingsService
const mockPrisma = {} as PrismaClient

describe('CompetitionService - Operaciones Básicas', () => {
  let competitionService: CompetitionService

  beforeEach(() => {
    jest.clearAllMocks()
    competitionService = new CompetitionService({
      competitionRepository: mockCompetitionRepository,
      competitionTypeRepository: mockCompetitionTypeRepository,
      standingsService: mockStandingsService,
      fixtureRepository: mockFixtureRepository,
      prisma: mockPrisma,
    })
  })

  describe('findAllCompetitions', () => {
    it('debería retornar todas las competiciones con sus tipos', async () => {
      const mockCompetitionType1: CompetitionType = {
        id: 'type-1',
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      const mockCompetitionType2: CompetitionType = {
        id: 'type-2',
        hierarchy: 2,
        name: 'CUP' as any,
        format: 'CUP' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy2.png',
      }

      const mockCompetitions: CompetitionWithType[] = [
        {
          id: '1',
          name: 'Liga A - T1',
          competitionTypeId: 'type-1',
          seasonId: 'season-1',
          system: 'ROUND_ROBIN' as any,
          isActive: true,
          parentCompetitionId: null,
          rules: {},
          competitionType: mockCompetitionType1,
        },
        {
          id: '2',
          name: 'Copa - T1',
          competitionTypeId: 'type-2',
          seasonId: 'season-1',
          system: 'KNOCKOUT' as any,
          isActive: true,
          parentCompetitionId: null,
          rules: {},
          competitionType: mockCompetitionType2,
        },
      ]

      mockCompetitionRepository.findAll.mockResolvedValue(mockCompetitions)

      const result = await competitionService.findAllCompetitions()

      expect(result).toHaveLength(2)
      expect(result![0].competition).toEqual(mockCompetitions[0])
      expect(result![0].competitionTypeData).toBeDefined()
      expect(result![1].competition).toEqual(mockCompetitions[1])
      expect(result![1].competitionTypeData).toBeDefined()
    })

    it('debería retornar null si no hay competiciones', async () => {
      mockCompetitionRepository.findAll.mockResolvedValue(null)

      const result = await competitionService.findAllCompetitions()

      expect(result).toBeNull()
    })
  })

  describe('findCompetition', () => {
    it('debería retornar una competición con su tipo', async () => {
      const mockCompetition: Competition = {
        id: '1',
        name: 'Liga A - T1',
        competitionTypeId: 'type-1',
        seasonId: 'season-1',
        system: 'ROUND_ROBIN' as any,
        isActive: true,
        parentCompetitionId: null,
        rules: {},
      }

      const mockCompetitionType: CompetitionType = {
        id: 'type-1',
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      mockCompetitionRepository.findOneById.mockResolvedValue(mockCompetition)
      mockCompetitionTypeRepository.findOneById.mockResolvedValue(mockCompetitionType)

      const result = await competitionService.findCompetition('1')

      expect(result.competition).toEqual(mockCompetition)
      expect(result.competitionTypeData).toBeDefined()
      expect(result.competitionTypeData?.name).toBe('FIRST_DIVISION')
    })

    it('debería lanzar CompetitionNotFoundError si no existe', async () => {
      mockCompetitionRepository.findOneById.mockResolvedValue(null)

      await expect(competitionService.findCompetition('999')).rejects.toThrow(CompetitionNotFoundError)
    })

    it('debería manejar el caso de competitionType null', async () => {
      const mockCompetition: Competition = {
        id: '1',
        name: 'Liga A - T1',
        competitionTypeId: 'type-1',
        seasonId: 'season-1',
        system: 'ROUND_ROBIN' as any,
        isActive: true,
        parentCompetitionId: null,
        rules: {},
      }

      mockCompetitionRepository.findOneById.mockResolvedValue(mockCompetition)
      mockCompetitionTypeRepository.findOneById.mockResolvedValue(null)

      const result = await competitionService.findCompetition('1')

      expect(result.competition).toEqual(mockCompetition)
      expect(result.competitionTypeData).toBeNull()
    })
  })

  describe('toggleCompetitionActive', () => {
    it('debería cambiar el estado activo de una competición', async () => {
      const mockCompetition: Competition = {
        id: '1',
        name: 'Liga A - T1',
        competitionTypeId: 'type-1',
        seasonId: 'season-1',
        system: 'ROUND_ROBIN' as any,
        isActive: true,
        parentCompetitionId: null,
        rules: {},
      }

      const updatedCompetition: Competition = { ...mockCompetition, isActive: false }

      const mockCompetitionType: CompetitionType = {
        id: 'type-1',
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      mockCompetitionRepository.findOneById.mockResolvedValue(mockCompetition)
      mockCompetitionRepository.updateIsActive.mockResolvedValue(updatedCompetition)
      mockCompetitionTypeRepository.findOneById.mockResolvedValue(mockCompetitionType)

      const result = await competitionService.toggleCompetitionActive('1', false)

      expect(mockCompetitionRepository.updateIsActive).toHaveBeenCalledWith('1', false)
      expect(result.competition.isActive).toBe(false)
      expect(result.competitionTypeData).toBeDefined()
    })

    it('debería lanzar error si la competición no existe', async () => {
      mockCompetitionRepository.findOneById.mockResolvedValue(null)

      await expect(competitionService.toggleCompetitionActive('999', true)).rejects.toThrow(CompetitionNotFoundError)
    })
  })
})
