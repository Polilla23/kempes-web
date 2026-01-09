import { Prisma } from '@prisma/client'
import { ISalaryRateRepository } from '@/features/salary-rates/interfaces/ISalaryRateRepository'
import { CreateSalaryRateInput } from '@/types'
import { SalaryRateNotFoundError, SalaryRateOverlapError, InvalidRangeError } from '@/features/salary-rates/salary-rates.errors'

export class SalaryRateService {
  private salaryRateRepository: ISalaryRateRepository

  constructor({ salaryRateRepository }: { salaryRateRepository: ISalaryRateRepository }) {
    this.salaryRateRepository = salaryRateRepository
  }

  async findAllSalaryRates() {
    return await this.salaryRateRepository.findAll()
  }

  async findSalaryRate(id: string) {
    const salaryRateFound = await this.salaryRateRepository.findOneById(id)

    if (!salaryRateFound) {
      throw new SalaryRateNotFoundError()
    }
    return salaryRateFound
  }

  async createSalaryRate({ minOverall, maxOverall, salary }: CreateSalaryRateInput) {
    // Validar que minOverall <= maxOverall
    if (minOverall > maxOverall) {
      throw new InvalidRangeError()
    }

    // Validar salario mínimo
    if (salary < 100000) {
      throw new Error('El salario debe ser mayor o igual a 100.000')
    }

    // Validar que no haya overlap con rangos existentes
    const existingRates = await this.salaryRateRepository.findAll()
    const hasOverlap = existingRates?.some(rate => {
      return (
        (minOverall >= rate.minOverall && minOverall <= rate.maxOverall) ||
        (maxOverall >= rate.minOverall && maxOverall <= rate.maxOverall) ||
        (minOverall <= rate.minOverall && maxOverall >= rate.maxOverall)
      )
    })

    if (hasOverlap) {
      throw new SalaryRateOverlapError()
    }

    const salaryRateData: Prisma.SalaryRateCreateInput = {
      minOverall,
      maxOverall,
      salary,
    }

    const newSalaryRate = await this.salaryRateRepository.save(salaryRateData)
    return newSalaryRate
  }

  async updateSalaryRate(id: string, data: Prisma.SalaryRateUpdateInput) {
    const salaryRateFound = await this.salaryRateRepository.findOneById(id)

    if (!salaryRateFound) {
      throw new SalaryRateNotFoundError()
    }

    // Validar salario mínimo si se está actualizando
    if (data.salary !== undefined && typeof data.salary === 'number' && data.salary < 100000) {
      throw new Error('El salario debe ser mayor o igual a 100.000')
    }

    // Si se están actualizando los rangos, validar
    if (data.minOverall !== undefined && data.maxOverall !== undefined) {
      const minAvg = typeof data.minOverall === 'number' ? data.minOverall : salaryRateFound.minOverall
      const maxAvg = typeof data.maxOverall === 'number' ? data.maxOverall : salaryRateFound.maxOverall

      if (minAvg > maxAvg) {
        throw new InvalidRangeError()
      }

      // Validar overlap excluyendo el registro actual
      const existingRates = await this.salaryRateRepository.findAll()
      const hasOverlap = existingRates?.some(rate => {
        if (rate.id === id) return false // Excluir el registro actual
        return (
          (minAvg >= rate.minOverall && minAvg <= rate.maxOverall) ||
          (maxAvg >= rate.minOverall && maxAvg <= rate.maxOverall) ||
          (minAvg <= rate.minOverall && maxAvg >= rate.maxOverall)
        )
      })

      if (hasOverlap) {
        throw new SalaryRateOverlapError()
      }
    }

    const result = await this.salaryRateRepository.updateOneById(id, data)
    return result
  }

  async deleteSalaryRate(id: string) {
    const salaryRateFound = await this.salaryRateRepository.findOneById(id)

    if (!salaryRateFound) {
      throw new SalaryRateNotFoundError()
    }

    return await this.salaryRateRepository.updateOneById(id, { isActive: false })
  }
}
