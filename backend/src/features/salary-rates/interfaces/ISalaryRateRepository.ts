import { Prisma, SalaryRate } from '@prisma/client'

export interface ISalaryRateRepository {
  findAll(): Promise<SalaryRate[] | null>
  findOneById(id: Prisma.SalaryRateWhereUniqueInput['id']): Promise<SalaryRate | null>
  save(data: Prisma.SalaryRateCreateInput): Promise<SalaryRate>
  updateOneById(id: Prisma.SalaryRateWhereUniqueInput['id'], data: Prisma.SalaryRateUpdateInput): Promise<SalaryRate>
  deleteOneById(id: Prisma.SalaryRateWhereUniqueInput['id']): Promise<SalaryRate>
}
