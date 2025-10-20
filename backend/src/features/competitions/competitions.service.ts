import {
  CompetitionAlreadyExistsError,
  CompetitionNotFoundError,
} from '@/features/competitions/competitions.errors'
import { ICompetitionRepository } from '@/features/competitions/interface/ICompetitionRepository'
import { validateCompetitionRules } from '@/features/utils/jsonTypeChecker'
import { KempesCupRules, LeaguesRules } from '@/features/utils/types'

export class CompetitionService {
  private competitionRepository: ICompetitionRepository

  constructor({ competitionRepository }: { competitionRepository: ICompetitionRepository }) {
    this.competitionRepository = competitionRepository
  }

  async findAllCompetitions() {
    return await this.competitionRepository.findAll()
  }

  async findCompetition(id: string) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }
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
    await this.competitionRepository.updateOneById(id, config)
  }

  async deleteCompetition(id: string) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }
    await this.competitionRepository.deleteOneById(id)
  }
}
