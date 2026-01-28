import { SalaryRateService } from '../salary-rates.service'
import { ISalaryRateRepository } from '../interfaces/ISalaryRateRepository'
import { SalaryRate } from '@prisma/client'
import { CreateSalaryRateInput } from '@/types'

const mockSalaryRateRepository: jest.Mocked<ISalaryRateRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
}

describe('SalaryRateService', () => {
  let salaryRateService: SalaryRateService

  beforeEach(() => {
    jest.clearAllMocks()
    salaryRateService = new SalaryRateService({
      salaryRateRepository: mockSalaryRateRepository,
    })
  })

  describe('createSalaryRate', () => {
    it('debería crear una escala salarial', async () => {
      const input: CreateSalaryRateInput = {
        minOverall: 80,
        maxOverall: 85,
        salary: 500000,
      }

      const expectedRate: SalaryRate = {
        id: '123',
        minOverall: 80,
        maxOverall: 85,
        salary: 500000,
        isActive: true,
      }

      mockSalaryRateRepository.save.mockResolvedValue(expectedRate)

      const result = await salaryRateService.createSalaryRate(input)

      expect(result).toEqual(expectedRate)
      expect(mockSalaryRateRepository.save).toHaveBeenCalledTimes(1)
    })

    it('debería validar que minOverall < maxOverall', async () => {
      const input: CreateSalaryRateInput = {
        minOverall: 85,
        maxOverall: 80,
        salary: 500000,
      }

      await expect(salaryRateService.createSalaryRate(input)).rejects.toThrow()
    })
  })

  describe('findAllSalaryRates', () => {
    it('debería retornar todas las escalas salariales', async () => {
      const mockRates: SalaryRate[] = [
        {
          id: '1',
          minOverall: 80,
          maxOverall: 85,
          salary: 500000,
          isActive: true,
        },
        {
          id: '2',
          minOverall: 85,
          maxOverall: 90,
          salary: 750000,
          isActive: true,
        },
      ]

      mockSalaryRateRepository.findAll.mockResolvedValue(mockRates)

      const result = await salaryRateService.findAllSalaryRates()

      expect(result).toEqual(mockRates)
    })
  })

  describe('findSalaryRateById', () => {
    it('debería retornar una escala salarial por ID', async () => {
      const rateId = '123'
      const mockRate: SalaryRate = {
        id: rateId,
        minOverall: 80,
        maxOverall: 85,
        salary: 500000,
        isActive: true,
      }

      mockSalaryRateRepository.findOneById.mockResolvedValue(mockRate)

      const result = await salaryRateService.findSalaryRate(rateId)

      expect(result).toEqual(mockRate)
    })

    it('debería lanzar error si no existe', async () => {
      mockSalaryRateRepository.findOneById.mockResolvedValue(null)

      await expect(salaryRateService.findSalaryRate('non-existent')).rejects.toThrow()
    })
  })

  describe('updateSalaryRate', () => {
    it('debería actualizar una escala salarial', async () => {
      const rateId = '123'
      const updateData = { salary: 600000 }

      const existingRate: SalaryRate = {
        id: rateId,
        minOverall: 80,
        maxOverall: 85,
        salary: 500000,
        isActive: true,
      }

      const updatedRate = { ...existingRate, salary: 600000 }

      mockSalaryRateRepository.findOneById.mockResolvedValue(existingRate)
      mockSalaryRateRepository.updateOneById.mockResolvedValue(updatedRate)

      const result = await salaryRateService.updateSalaryRate(rateId, updateData)

      expect(result.salary).toBe(600000)
    })
  })

  describe('deleteSalaryRate', () => {
    it('debería eliminar una escala salarial', async () => {
      const rateId = '123'
      const mockRate: SalaryRate = {
        id: rateId,
        minOverall: 80,
        maxOverall: 85,
        salary: 500000,
        isActive: true,
      }

      const deletedRate: SalaryRate = {
        ...mockRate,
        isActive: false,
      }

      mockSalaryRateRepository.findOneById.mockResolvedValue(mockRate)
      mockSalaryRateRepository.updateOneById.mockResolvedValue(deletedRate)

      const result = await salaryRateService.deleteSalaryRate(rateId)

      expect(result).toEqual(deletedRate)
      expect(mockSalaryRateRepository.updateOneById).toHaveBeenCalledWith(rateId, { isActive: false })
    })
  })
})
