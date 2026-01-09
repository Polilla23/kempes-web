import { SalaryRate } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { SalaryRateService } from '@/features/salary-rates/salary-rates.service'
import { SalaryRateMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'

export class SalaryRateController {
  private salaryRateService: SalaryRateService

  constructor({ salaryRateService }: { salaryRateService: SalaryRateService }) {
    this.salaryRateService = salaryRateService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const { minOverall, maxOverall, salary } = req.body as {
      minOverall: number
      maxOverall: number
      salary: number
    }

    try {
      const validatedData = {
        minOverall: Validator.number(minOverall, 0, 100),
        maxOverall: Validator.number(maxOverall, 0, 100),
        salary: Validator.number(salary, 100000),
      }

      const newSalaryRate = await this.salaryRateService.createSalaryRate(validatedData)
      const salaryRateDTO = SalaryRateMapper.toDTO(newSalaryRate)

      return Response.created(reply, salaryRateDTO, 'Salary rate created successfully')
    } catch (error: any) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Validation failed',
        'Error while creating new salary rate'
      )
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const salaryRates = await this.salaryRateService.findAllSalaryRates()
      const salaryRateDTOs = SalaryRateMapper.toDTOArray(salaryRates ?? [])

      if (salaryRateDTOs.length === 0) {
        return Response.success(reply, [], 'No salary rates found')
      }

      return Response.success(reply, salaryRateDTOs, 'Salary rates fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching the salary rates',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const salaryRate = await this.salaryRateService.findSalaryRate(validId)
      const salaryRateDTO = SalaryRateMapper.toDTO(salaryRate)

      return Response.success(reply, salaryRateDTO, 'Salary rate fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Salary rate', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching the salary rate',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<SalaryRate> }>, reply: FastifyReply) {
    const data = req.body
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const validatedData: Partial<SalaryRate> = {}

      if (data.minOverall !== undefined) validatedData.minOverall = Validator.number(data.minOverall, 0, 100)
      if (data.maxOverall !== undefined) validatedData.maxOverall = Validator.number(data.maxOverall, 0, 100)
      if (data.salary !== undefined) validatedData.salary = Validator.number(data.salary, 100000)

      const updatedSalaryRate = await this.salaryRateService.updateSalaryRate(validId, validatedData)
      const salaryRateDTO = SalaryRateMapper.toDTO(updatedSalaryRate)

      return Response.success(reply, salaryRateDTO, 'Salary rate updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Salary rate', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating the salary rate',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      await this.salaryRateService.deleteSalaryRate(validId)

      return Response.success(reply, null, 'Salary rate deleted successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Salary rate', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting the salary rate',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
