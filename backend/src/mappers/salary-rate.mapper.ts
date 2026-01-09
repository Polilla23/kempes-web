import { SalaryRate } from '@prisma/client'
import { SalaryRateDTO, PaginatedResponse } from '@/types'

export class SalaryRateMapper {
  static toDTO(salaryRate: SalaryRate): SalaryRateDTO {
    return {
      id: salaryRate.id,
      minOverall: salaryRate.minOverall,
      maxOverall: salaryRate.maxOverall,
      salary: salaryRate.salary,
      isActive: salaryRate.isActive,
    }
  }

  static toDTOArray(salaryRates: SalaryRate[]): SalaryRateDTO[] {
    return salaryRates.map(this.toDTO)
  }

  static toPaginatedDTO(
    salaryRates: SalaryRate[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponse<SalaryRateDTO> {
    return {
      data: this.toDTOArray(salaryRates),
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
      timestamp: new Date().toISOString(),
    }
  }
}
