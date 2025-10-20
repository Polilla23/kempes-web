import { Prisma } from '@prisma/client'
import { ICompetitionTypeRepository } from '@/features/competition-types/interface/ICompetitionTypeRepository'
import { CreateCompetitionTypeInput } from '@/features/utils/types'

// Errors
import {
  CompetitionTypeAlreadyExistsError,
  CompetitionTypeNotFoundError,
} from '@/features/competition-types/competition-types.errors'

export class CompetitionTypeService {
  private competitionTypeRepository: ICompetitionTypeRepository

  constructor({ competitionTypeRepository }: { competitionTypeRepository: ICompetitionTypeRepository }) {
    this.competitionTypeRepository = competitionTypeRepository
  }

  async findAllCompetitionTypes() {
    return await this.competitionTypeRepository.findAll()
  }

  async findCompetitionType(id: string) {
    const competitionType = await this.competitionTypeRepository.findOneById(id)

    if (!competitionType) {
      throw new CompetitionTypeNotFoundError()
    }
    return competitionType
  }

  async createCompetitionType({ hierarchy, name, format, category }: CreateCompetitionTypeInput) {
    const competitionTypeFound = await this.competitionTypeRepository.findOneByName(name)
    if (competitionTypeFound) {
      throw new CompetitionTypeAlreadyExistsError()
    }
    const competitionTypeData: Prisma.CompetitionTypeCreateInput = {
      hierarchy,
      name,
      format,
      category,
    }

    const newCompetitionType = await this.competitionTypeRepository.save(competitionTypeData)
    return newCompetitionType
  }

  async updateCompetitionType(id: string, data: Prisma.CompetitionTypeUpdateInput) {
    const competitionType = await this.competitionTypeRepository.findOneById(id)
    if (!competitionType) {
      throw new CompetitionTypeNotFoundError()
    }

    return await this.competitionTypeRepository.updateOneById(id, data)
  }

  async deleteCompetitionType(id: string) {
    const competitionType = await this.competitionTypeRepository.findOneById(id)
    if (!competitionType) {
      throw new CompetitionTypeNotFoundError()
    }

    return await this.competitionTypeRepository.deleteOneById(id)
  }
}
