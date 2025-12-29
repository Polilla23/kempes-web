import {
  CompetitionAlreadyExistsError,
  CompetitionNotFoundError,
} from '@/features/competitions/competitions.errors'
import { ICompetitionRepository } from '@/features/competitions/interface/ICompetitionRepository'
import { ICompetitionTypeRepository } from '@/features/competition-types/interface/ICompetitionTypeRepository'
import { validateCompetitionRules } from '@/features/utils/jsonTypeChecker'
import { KempesCupRules, LeaguesRules } from '@/types'
import { Competition } from '@prisma/client'

export class CompetitionService {
  private competitionRepository: ICompetitionRepository
  private competitionTypeRepository: ICompetitionTypeRepository

  constructor({ 
    competitionRepository,
    competitionTypeRepository 
  }: { 
    competitionRepository: ICompetitionRepository
    competitionTypeRepository: ICompetitionTypeRepository
  }) {
    this.competitionRepository = competitionRepository
    this.competitionTypeRepository = competitionTypeRepository
  }

  // Helper method para enriquecer competitions con competitionType data
  private async enrichCompetitionWithType(competition: Competition) {
    const competitionType = await this.competitionTypeRepository.findOneById(competition.competitionTypeId)
    return {
      competition,
      competitionTypeData: competitionType ? {
        id: competitionType.id,
        name: competitionType.name.toString(),
        category: competitionType.category.toString(),
        format: competitionType.format.toString(),
      } : null
    }
  }

  async findAllCompetitions() {
    const competitions = await this.competitionRepository.findAll()
    if (!competitions) return null
    
    // Enriquecer cada competition con su competitionType
    const enrichedPromises = competitions.map(comp => this.enrichCompetitionWithType(comp))
    return await Promise.all(enrichedPromises)
  }

  async findCompetition(id: string) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }
    return await this.enrichCompetitionWithType(competitionFound)
  }

  async createCompetition(config: Partial<LeaguesRules | KempesCupRules>) {
    const validatedConfig = validateCompetitionRules(config)
    const competitionFound = await this.competitionRepository.findOneBySeasonId(
      validatedConfig.activeSeason.id
    )
    if (competitionFound) {
      throw new CompetitionAlreadyExistsError()
    }
    const competitionCreated = await this.competitionRepository.save(validatedConfig)
    return competitionCreated
  }

  async updateCompetition(id: string, config: Partial<LeaguesRules | KempesCupRules>) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }
    const updatedCompetition = await this.competitionRepository.updateOneById(id, config)
    return await this.enrichCompetitionWithType(updatedCompetition)
  }

  async deleteCompetition(id: string) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }
    return await this.competitionRepository.deleteOneById(id)
  }
}
