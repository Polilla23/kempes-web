import { ICompetitionRepository } from 'interfaces/ICompetitionRepository'
import { validateCompetitionRules } from 'utils/jsonTypeChecker'

export class CompetitionService {
  private competitionRepository: ICompetitionRepository

  constructor({ competitionRepository }: { competitionRepository: ICompetitionRepository }) {
    this.competitionRepository = competitionRepository
  }

  async createCompetition(config: object) {
    const validatedConfig = validateCompetitionRules(config)
    const competitionCreated = await this.competitionRepository.createCompetition(validatedConfig)
  }
}
