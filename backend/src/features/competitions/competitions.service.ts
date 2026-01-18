import {
  CompetitionAlreadyExistsError,
  CompetitionNotFoundError,
} from '@/features/competitions/competitions.errors'
import { ICompetitionRepository } from '@/features/competitions/interface/ICompetitionRepository'
import { ICompetitionTypeRepository } from '@/features/competition-types/interface/ICompetitionTypeRepository'
import { FixtureRepository } from '@/features/fixtures/fixtures.repository'
import { validateCompetitionRules, isLeaguesRules, isKempesCupRules } from '@/features/utils/jsonTypeChecker'
import { generateLeagueFixture, generateFullCupFixture } from '@/features/utils/generateFixture'
import { KempesCupRules, LeaguesRules } from '@/types'
import { Competition, Match, Prisma, PrismaClient, CompetitionStage, CompetitionName } from '@prisma/client'

export class CompetitionService {
  private competitionRepository: ICompetitionRepository
  private competitionTypeRepository: ICompetitionTypeRepository
  private fixtureRepository: FixtureRepository
  private prisma: PrismaClient

  constructor({
    competitionRepository,
    competitionTypeRepository,
    fixtureRepository,
    prisma,
  }: {
    competitionRepository: ICompetitionRepository
    competitionTypeRepository: ICompetitionTypeRepository
    fixtureRepository: FixtureRepository
    prisma: PrismaClient
  }) {
    this.competitionRepository = competitionRepository
    this.competitionTypeRepository = competitionTypeRepository
    this.fixtureRepository = fixtureRepository
    this.prisma = prisma
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
            hierarchy: competitionType.hierarchy,
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
    
    // Verificar si ya existen competiciones del mismo tipo en esta temporada
    const existingCompetitions = await this.competitionRepository.findOneBySeasonId(
      validatedConfig.activeSeason.id
    )
    
    if (existingCompetitions && existingCompetitions.length > 0) {
      // Verificar si es el mismo tipo de competición (ligas vs copa)
      const isCreatingLeagues = isLeaguesRules(validatedConfig)
      const isCreatingCup = isKempesCupRules(validatedConfig)
      
      // Obtener los tipos de las competiciones existentes
      const existingTypes = await Promise.all(
        existingCompetitions.map(async (comp) => {
          const type = await this.competitionTypeRepository.findOneById(comp.competitionTypeId)
          return type?.format
        })
      )
      
      const hasExistingLeagues = existingTypes.some(format => format === 'LEAGUE')
      const hasExistingCup = existingTypes.some(format => format === 'CUP')
      
      // Solo bloquear si ya existe el mismo tipo
      if (isCreatingLeagues && hasExistingLeagues) {
        throw new CompetitionAlreadyExistsError()
      }
      if (isCreatingCup && hasExistingCup) {
        throw new CompetitionAlreadyExistsError()
      }
    }

    // Si son ligas, crear todo en una transacción
    if (isLeaguesRules(validatedConfig)) {
      const leaguesConfig = validatedConfig as LeaguesRules
      const result = await this.prisma.$transaction(async (tx) => {
        const createdCompetitions: Competition[] = []
        const fixturesResults: { competition: Competition; matchesCreated: number; matches: Match[] }[] = []

        // Crear todas las competiciones y sus fixtures
        for (const league of leaguesConfig.leagues) {

          // Crear la competición
          const competition = await tx.competition.create({
            data: {
              name: `${league.active_league.name} ${leaguesConfig.competitionCategory} - T${leaguesConfig.activeSeason.number}`,
              system: CompetitionStage.ROUND_ROBIN,
              competitionTypeId: league.active_league.id,
              seasonId: leaguesConfig.activeSeason.id,
              isActive: true,
              rules: league as unknown as Prisma.InputJsonValue,
            },
          })
          createdCompetitions.push(competition)

          // Generar fixtures para esta liga
          const matchesData = generateLeagueFixture(
            league.clubIds,
            competition.id,
            league.roundType === 'match_and_rematch'
          )

          // Crear los matches en la transacción (secuencialmente para evitar sobrecarga)
          const createdMatches: Match[] = []
          for (const matchData of matchesData) {
            const match = await tx.match.create({ data: matchData })
            createdMatches.push(match)
          }

          fixturesResults.push({
            competition,
            matchesCreated: createdMatches.length,
            matches: createdMatches,
          })
        }

        return {
          success: true,
          competitions: createdCompetitions,
          fixtures: fixturesResults,
        }
      }, {
        timeout: 60000, // 60 segundos de timeout para manejar muchos matches
      })

      return result
    }

    // Para copas, crear las 3 competiciones (fase de grupos, copa oro, copa plata)
    // y generar TODOS los fixtures automáticamente
    if (isKempesCupRules(validatedConfig)) {
      const cupConfig = validatedConfig as KempesCupRules
      
      const result = await this.prisma.$transaction(async (tx) => {
        const createdCompetitions: Competition[] = []
        const seasonNumber = cupConfig.activeSeason.number
        const category = cupConfig.competitionCategory

        // 1. Crear competición de Fase de Grupos (Copa Kempes)
        const groupStageCompetition = await tx.competition.create({
          data: {
            name: `Copa Kempes - Fase de Grupos ${category} - T${seasonNumber}`,
            system: CompetitionStage.ROUND_ROBIN,
            competitionTypeId: cupConfig.competitionType.id,
            seasonId: cupConfig.activeSeason.id,
            isActive: true,
            rules: cupConfig as unknown as Prisma.InputJsonValue,
          },
        })
        createdCompetitions.push(groupStageCompetition)

        // 2. Buscar o crear CompetitionType para Copa Oro
        let goldCupType = await tx.competitionType.findFirst({
          where: { name: CompetitionName.GOLD_CUP, category },
        })
        if (!goldCupType) {
          goldCupType = await tx.competitionType.create({
            data: {
              name: CompetitionName.GOLD_CUP,
              category,
              format: 'CUP',
              hierarchy: 10, // Copa Oro tiene alta jerarquía
            },
          })
        }

        // 3. Crear competición Copa Oro
        const goldCupCompetition = await tx.competition.create({
          data: {
            name: `Copa de Oro ${category} - T${seasonNumber}`,
            system: CompetitionStage.KNOCKOUT,
            competitionTypeId: goldCupType.id,
            seasonId: cupConfig.activeSeason.id,
            isActive: true,
            rules: { 
              type: 'CUP_KNOCKOUT', 
              parentCup: groupStageCompetition.id,
              cupType: 'GOLD',
            } as unknown as Prisma.InputJsonValue,
          },
        })
        createdCompetitions.push(goldCupCompetition)

        // 4. Crear competición Copa Plata (si hay clasificados)
        let silverCupCompetition: Competition | null = null
        if (cupConfig.qualifyToSilver > 0) {
          let silverCupType = await tx.competitionType.findFirst({
            where: { name: CompetitionName.SILVER_CUP, category },
          })
          if (!silverCupType) {
            silverCupType = await tx.competitionType.create({
              data: {
                name: CompetitionName.SILVER_CUP,
                category,
                format: 'CUP',
                hierarchy: 11, // Copa Plata tiene jerarquía después de Oro
              },
            })
          }

          silverCupCompetition = await tx.competition.create({
            data: {
              name: `Copa de Plata ${category} - T${seasonNumber}`,
              system: CompetitionStage.KNOCKOUT,
              competitionTypeId: silverCupType.id,
              seasonId: cupConfig.activeSeason.id,
              isActive: true,
              rules: { 
                type: 'CUP_KNOCKOUT', 
                parentCup: groupStageCompetition.id,
                cupType: 'SILVER',
              } as unknown as Prisma.InputJsonValue,
            },
          })
          createdCompetitions.push(silverCupCompetition)
        }

        // 5. Generar todos los fixtures
        const fixtureConfig = {
          groupStageCompetitionId: groupStageCompetition.id,
          goldCupCompetitionId: goldCupCompetition.id,
          silverCupCompetitionId: silverCupCompetition?.id || '',
          groups: cupConfig.groups || [],
          qualifyToGold: cupConfig.qualifyToGold,
          qualifyToSilver: cupConfig.qualifyToSilver,
        }

        const { groupStageMatches, goldCupMatches, silverCupMatches } = generateFullCupFixture(fixtureConfig)

        // 6. Crear matches de fase de grupos (secuencialmente para evitar timeout)
        const createdGroupMatches: Match[] = []
        for (const matchData of groupStageMatches) {
          const match = await tx.match.create({ data: matchData })
          createdGroupMatches.push(match)
        }

        // 7. Crear matches de Copa Oro
        const createdGoldMatches: Match[] = []
        for (const matchData of goldCupMatches) {
          const match = await tx.match.create({ data: matchData })
          createdGoldMatches.push(match)
        }

        // 8. Crear matches de Copa Plata
        const createdSilverMatches: Match[] = []
        for (const matchData of silverCupMatches) {
          const match = await tx.match.create({ data: matchData })
          createdSilverMatches.push(match)
        }

        return {
          success: true,
          competitions: createdCompetitions,
          fixtures: [
            { competition: groupStageCompetition, matchesCreated: createdGroupMatches.length, matches: createdGroupMatches },
            { competition: goldCupCompetition, matchesCreated: createdGoldMatches.length, matches: createdGoldMatches },
            ...(silverCupCompetition ? [{ competition: silverCupCompetition, matchesCreated: createdSilverMatches.length, matches: createdSilverMatches }] : []),
          ],
        }
      }, {
        timeout: 120000, // 2 minutos de timeout para copas (más matches)
      })

      return result
    }

    throw new Error('Invalid competition configuration')
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
