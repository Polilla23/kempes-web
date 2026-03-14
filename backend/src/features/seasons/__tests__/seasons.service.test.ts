import { SeasonService } from '../seasons.service'
import { ISeasonRepository } from '../interface/ISeasonRepository'
import { Season, Prisma, PrismaClient } from '@prisma/client'
import {
  SeasonNotFoundError,
  SeasonAlreadyExistsError,
  ActiveSeasonAlreadyExistsError,
} from '../seasons.errors'

const mockSeasonRepository: jest.Mocked<ISeasonRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOneByNumber: jest.fn(),
  findActiveSeason: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
  findTransitionsBySeason: jest.fn(),
  countPendingMatches: jest.fn(),
  saveTransitions: jest.fn(),
}

const mockSeasonHalfService = {
  createSeasonHalves: jest.fn(),
  activateSeasonHalf: jest.fn(),
  findBySeasonId: jest.fn(),
  findActiveSeasonHalf: jest.fn(),
  advanceToNextHalf: jest.fn(),
} as any

const mockPrisma = {} as PrismaClient

describe('SeasonService - Operaciones Básicas', () => {
  let seasonService: SeasonService

  beforeEach(() => {
    jest.clearAllMocks()
    mockSeasonHalfService.createSeasonHalves.mockResolvedValue([
      { id: 'half-1', halfType: 'FIRST_HALF', seasonId: '1', isActive: false },
      { id: 'half-2', halfType: 'SECOND_HALF', seasonId: '1', isActive: false },
    ])
    mockSeasonHalfService.activateSeasonHalf.mockResolvedValue({})
    seasonService = new SeasonService({
      seasonRepository: mockSeasonRepository,
      seasonHalfService: mockSeasonHalfService,
      prisma: mockPrisma,
    })
  })

  describe('findAllSeasons', () => {
    it('debería retornar todas las temporadas', async () => {
      const mockSeasons: Season[] = [
        {
          id: '1',
          number: 1,
          isActive: false,
        },
        {
          id: '2',
          number: 2,
          isActive: true,
        },
      ]

      mockSeasonRepository.findAll.mockResolvedValue(mockSeasons)

      const result = await seasonService.findAllSeasons()

      expect(result).toEqual(mockSeasons)
      expect(mockSeasonRepository.findAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('findSeasonById', () => {
    it('debería retornar una temporada por id', async () => {
      const mockSeason: Season = {
        id: '1',
        number: 1,
        isActive: true,
      }

      mockSeasonRepository.findOneById.mockResolvedValue(mockSeason)

      const result = await seasonService.findSeasonById('1')

      expect(result).toEqual(mockSeason)
      expect(mockSeasonRepository.findOneById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar SeasonNotFoundError si no existe', async () => {
      mockSeasonRepository.findOneById.mockResolvedValue(null)

      await expect(seasonService.findSeasonById('999')).rejects.toThrow(SeasonNotFoundError)
    })
  })

  describe('findActiveSeason', () => {
    it('debería retornar la temporada activa', async () => {
      const mockSeason: Season = {
        id: '1',
        number: 1,
        isActive: true,
      }

      mockSeasonRepository.findActiveSeason.mockResolvedValue(mockSeason)

      const result = await seasonService.findActiveSeason()

      expect(result).toEqual(mockSeason)
      expect(mockSeasonRepository.findActiveSeason).toHaveBeenCalledTimes(1)
    })

    it('debería lanzar SeasonNotFoundError si no hay temporada activa', async () => {
      mockSeasonRepository.findActiveSeason.mockResolvedValue(null)

      await expect(seasonService.findActiveSeason()).rejects.toThrow(SeasonNotFoundError)
    })
  })

  describe('createSeason', () => {
    it('debería crear una temporada', async () => {
      const input: Prisma.SeasonCreateInput = {
        number: 1,
        isActive: false,
      }

      const expectedSeason: Season = {
        id: '1',
        number: 1,
        isActive: false,
      }

      mockSeasonRepository.findOneByNumber.mockResolvedValue(null)
      mockSeasonRepository.save.mockResolvedValue(expectedSeason)

      const result = await seasonService.createSeason(input)

      expect(result).toEqual(expectedSeason)
      expect(mockSeasonRepository.findOneByNumber).toHaveBeenCalledWith(1)
      expect(mockSeasonRepository.save).toHaveBeenCalledWith(input)
    })

    it('debería lanzar SeasonAlreadyExistsError si el número ya existe', async () => {
      const input: Prisma.SeasonCreateInput = {
        number: 1,
        isActive: false,
      }

      const existingSeason: Season = {
        id: '1',
        number: 1,
        isActive: false,
      }

      mockSeasonRepository.findOneByNumber.mockResolvedValue(existingSeason)

      await expect(seasonService.createSeason(input)).rejects.toThrow(SeasonAlreadyExistsError)
      expect(mockSeasonRepository.save).not.toHaveBeenCalled()
    })

    it('debería lanzar ActiveSeasonAlreadyExistsError si intenta crear una temporada activa cuando ya existe una', async () => {
      const input: Prisma.SeasonCreateInput = {
        number: 2,
        isActive: true,
      }

      const activeSeason: Season = {
        id: '1',
        number: 1,
        isActive: true,
      }

      mockSeasonRepository.findOneByNumber.mockResolvedValue(null)
      mockSeasonRepository.findActiveSeason.mockResolvedValue(activeSeason)

      await expect(seasonService.createSeason(input)).rejects.toThrow(ActiveSeasonAlreadyExistsError)
      expect(mockSeasonRepository.save).not.toHaveBeenCalled()
    })

    it('debería crear una temporada activa si no existe ninguna activa', async () => {
      const input: Prisma.SeasonCreateInput = {
        number: 1,
        isActive: true,
      }

      const expectedSeason: Season = {
        id: '1',
        number: 1,
        isActive: true,
      }

      mockSeasonRepository.findOneByNumber.mockResolvedValue(null)
      mockSeasonRepository.findActiveSeason.mockResolvedValue(null)
      mockSeasonRepository.save.mockResolvedValue(expectedSeason)

      const result = await seasonService.createSeason(input)

      expect(result).toEqual(expectedSeason)
    })
  })

  describe('updateSeason', () => {
    it('debería actualizar una temporada', async () => {
      const existingSeason: Season = {
        id: '1',
        number: 1,
        isActive: false,
      }

      const updateData: Prisma.SeasonUpdateInput = {
        number: 2,
      }

      const updatedSeason: Season = {
        ...existingSeason,
        number: 2,
      }

      mockSeasonRepository.findOneById.mockResolvedValue(existingSeason)
      mockSeasonRepository.updateOneById.mockResolvedValue(updatedSeason)

      const result = await seasonService.updateSeason('1', updateData)

      expect(result).toEqual(updatedSeason)
      expect(mockSeasonRepository.findOneById).toHaveBeenCalledWith('1')
      expect(mockSeasonRepository.updateOneById).toHaveBeenCalledWith('1', updateData)
    })

    it('debería lanzar SeasonNotFoundError si no existe', async () => {
      const updateData: Prisma.SeasonUpdateInput = {
        number: 2,
      }

      mockSeasonRepository.findOneById.mockResolvedValue(null)

      await expect(seasonService.updateSeason('999', updateData)).rejects.toThrow(SeasonNotFoundError)
      expect(mockSeasonRepository.updateOneById).not.toHaveBeenCalled()
    })

    it('debería lanzar ActiveSeasonAlreadyExistsError si intenta activar cuando ya hay una activa', async () => {
      const existingSeason: Season = {
        id: '1',
        number: 1,
        isActive: false,
      }

      const activeSeason: Season = {
        id: '2',
        number: 2,
        isActive: true,
      }

      const updateData: Prisma.SeasonUpdateInput = {
        isActive: true,
      }

      mockSeasonRepository.findOneById.mockResolvedValue(existingSeason)
      mockSeasonRepository.findActiveSeason.mockResolvedValue(activeSeason)

      await expect(seasonService.updateSeason('1', updateData)).rejects.toThrow(
        ActiveSeasonAlreadyExistsError,
      )
      expect(mockSeasonRepository.updateOneById).not.toHaveBeenCalled()
    })

    it('debería permitir activar la misma temporada', async () => {
      const existingSeason: Season = {
        id: '1',
        number: 1,
        isActive: true,
      }

      const updateData: Prisma.SeasonUpdateInput = {
        isActive: true,
      }

      mockSeasonRepository.findOneById.mockResolvedValue(existingSeason)
      mockSeasonRepository.findActiveSeason.mockResolvedValue(existingSeason)
      mockSeasonRepository.updateOneById.mockResolvedValue(existingSeason)

      const result = await seasonService.updateSeason('1', updateData)

      expect(result).toEqual(existingSeason)
      expect(mockSeasonRepository.updateOneById).toHaveBeenCalled()
    })
  })

  describe('deleteSeason', () => {
    it('debería eliminar una temporada', async () => {
      const existingSeason: Season = {
        id: '1',
        number: 1,
        isActive: false,
      }

      mockSeasonRepository.findOneById.mockResolvedValue(existingSeason)
      mockSeasonRepository.deleteOneById.mockResolvedValue(existingSeason)

      const result = await seasonService.deleteSeason('1')

      expect(result).toEqual(existingSeason)
      expect(mockSeasonRepository.findOneById).toHaveBeenCalledWith('1')
      expect(mockSeasonRepository.deleteOneById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar SeasonNotFoundError si no existe', async () => {
      mockSeasonRepository.findOneById.mockResolvedValue(null)

      await expect(seasonService.deleteSeason('999')).rejects.toThrow(SeasonNotFoundError)
      expect(mockSeasonRepository.deleteOneById).not.toHaveBeenCalled()
    })
  })
})

