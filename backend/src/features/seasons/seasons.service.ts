import { Prisma } from '@prisma/client'
import { ISeasonRepository } from '@/features/seasons/interface/ISeasonRepository'
import { 
  SeasonNotFoundError, 
  SeasonAlreadyExistsError,
  ActiveSeasonAlreadyExistsError 
} from '@/features/seasons/seasons.errors'

export class SeasonService {
  private seasonRepository: ISeasonRepository

  constructor({ seasonRepository }: { seasonRepository: ISeasonRepository }) {
    this.seasonRepository = seasonRepository
  }

  async findAllSeasons() {
    return await this.seasonRepository.findAll()
  }

  async findSeasonById(id: string) {
    const season = await this.seasonRepository.findOneById(id)
    if (!season) {
      throw new SeasonNotFoundError()
    }
    return season
  }

  async findActiveSeason() {
    const season = await this.seasonRepository.findActiveSeason()
    if (!season) {
      throw new SeasonNotFoundError()
    }
    return season
  }

  async createSeason(data: Prisma.SeasonCreateInput) {
    const existing = await this.seasonRepository.findOneByNumber(data.number)
    if (existing) {
      throw new SeasonAlreadyExistsError()
    }

    if (data.isActive) {
      const activeSeason = await this.seasonRepository.findActiveSeason()
      if (activeSeason) {
        throw new ActiveSeasonAlreadyExistsError()
      }
    }

    return await this.seasonRepository.save(data)
  }

  async updateSeason(id: string, data: Prisma.SeasonUpdateInput) {
    const season = await this.seasonRepository.findOneById(id)
    if (!season) {
      throw new SeasonNotFoundError()
    }

    if (data.isActive === true) {
      const activeSeason = await this.seasonRepository.findActiveSeason()
      if (activeSeason && activeSeason.id !== id) {
        throw new ActiveSeasonAlreadyExistsError()
      }
    }

    return await this.seasonRepository.updateOneById(id, data)
  }

  async deleteSeason(id: string) {
    const season = await this.seasonRepository.findOneById(id)
    if (!season) {
      throw new SeasonNotFoundError()
    }
    return await this.seasonRepository.deleteOneById(id)
  }
}
