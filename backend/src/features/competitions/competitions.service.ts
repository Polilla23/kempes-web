import {
  CompetitionAlreadyExistsError,
  CompetitionNotFoundError,
} from '@/features/competitions/competitions.errors'
import { ICompetitionRepository } from '@/features/competitions/interface/ICompetitionRepository'
import { ICompetitionTypeRepository } from '@/features/competition-types/interface/ICompetitionTypeRepository'
import { FixtureRepository } from '@/features/fixtures/fixtures.repository'
import { validateCompetitionRules, isLeaguesRules } from '@/features/utils/jsonTypeChecker'
import { generateLeagueFixture } from '@/features/utils/generateFixture'
import { KempesCupRules, LeaguesRules } from '@/types'
import { Competition, Match } from '@prisma/client'

export class CompetitionService {
  private competitionRepository: ICompetitionRepository
  private competitionTypeRepository: ICompetitionTypeRepository
  private fixtureRepository: FixtureRepository

  constructor({
    competitionRepository,
    competitionTypeRepository,
    fixtureRepository,
  }: {
    competitionRepository: ICompetitionRepository
    competitionTypeRepository: ICompetitionTypeRepository
    fixtureRepository: FixtureRepository
  }) {
    this.competitionRepository = competitionRepository
    this.competitionTypeRepository = competitionTypeRepository
    this.fixtureRepository = fixtureRepository
  }

  // Helper method para enriquecer competitions con competitionType data
  private async enrichCompetitionWithType(competition: Competition) {
    const competitionType = await this.competitionTypeRepository.findOneById(competition.competitionTypeId)
    return {
      competition,
      competitionTypeData: competitionType
        ? {
            id: competitionType.id,
            name: competitionType.name.toString(),
            category: competitionType.category.toString(),
            format: competitionType.format.toString(),
          }
        : null,
    }
  }

  async findAllCompetitions() {
    const competitions = await this.competitionRepository.findAll()
    if (!competitions) return null

    // Enriquecer cada competition con su competitionType
    const enrichedPromises = competitions.map((comp) => this.enrichCompetitionWithType(comp))
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
    if (competitionFound && competitionFound.length > 0) {
      throw new CompetitionAlreadyExistsError()
    }

    // Crear las competiciones
    const createdCompetitions = await this.competitionRepository.save(validatedConfig)

    // Si son ligas, crear los fixtures automáticamente
    if (isLeaguesRules(validatedConfig)) {
      const leaguesConfig = validatedConfig as LeaguesRules
      const fixturesResults: { competition: Competition; matchesCreated: number; matches: Match[] }[] = []

      for (let i = 0; i < leaguesConfig.leagues.length; i++) {
        const league = leaguesConfig.leagues[i]
        const competition = createdCompetitions[i]

        // Generar fixtures para esta liga
        const matchesData = generateLeagueFixture(
          league.clubIds,
          competition.id,
          league.roundType === 'match_and_rematch'
        )

        // Crear los matches en la base de datos
        const matchesCreated = await this.fixtureRepository.createManyMatches(matchesData)

        // Obtener los matches creados
        const matches = await this.fixtureRepository.getMatchesByCompetition(competition.id)

        fixturesResults.push({
          competition,
          matchesCreated,
          matches: matches || [],
        })
      }

      return {
        success: true,
        competitions: createdCompetitions,
        fixtures: fixturesResults,
      }
    }

    // Para copas, retornar solo las competiciones (fixtures se crean después manualmente)
    return {
      success: true,
      competitions: createdCompetitions,
      fixtures: [],
    }
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
