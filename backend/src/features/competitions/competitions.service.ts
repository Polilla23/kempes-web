import {
  CompetitionAlreadyExistsError,
  CompetitionNotFoundError,
} from '@/features/competitions/competitions.errors'
import { ICompetitionRepository } from '@/features/competitions/interface/ICompetitionRepository'
import { ICompetitionTypeRepository } from '@/features/competition-types/interface/ICompetitionTypeRepository'
import { FixtureRepository } from '@/features/fixtures/fixtures.repository'
import { validateCompetitionRules, isLeaguesRules, isKempesCupRules, isCindorCupRules, isSuperCupRules } from '@/features/utils/jsonTypeChecker'
import { generateLeagueFixture, generateFullCupFixture, generateDirectKnockoutBracket, generateEmptyBracketStructure, BracketTeamPlacement, EmptyBracketStructure } from '@/features/utils/generateFixture'
import { KempesCupRules, LeaguesRules, CompetitionRules, CindorCupRules, SuperCupRules } from '@/types'
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

    if (!competitionType) {
      console.warn(`CompetitionType not found for competition ${competition.id} with typeId: ${competition.competitionTypeId}`)
    }

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
    // findAll() ya incluye competitionType gracias al include de Prisma
    const competitions = await this.competitionRepository.findAll()
    if (!competitions) return null

    // Mapear directamente usando los datos incluidos por Prisma
    return competitions.map((comp) => {
      const { competitionType } = comp

      if (!competitionType) {
        console.warn(`CompetitionType not included for competition ${comp.id} (${comp.name}) with typeId: ${comp.competitionTypeId}`)
      }

      return {
        competition: comp,
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
    })
  }

  async findCompetition(id: string) {
    const competitionFound = await this.competitionRepository.findOneById(id)
    if (!competitionFound) {
      throw new CompetitionNotFoundError()
    }
    return await this.enrichCompetitionWithType(competitionFound)
  }

  async createCompetition(config: Partial<LeaguesRules | KempesCupRules | CindorCupRules | SuperCupRules>) {
    const validatedConfig = validateCompetitionRules(config)

    // Verificar si ya existen competiciones del mismo tipo en esta temporada
    const existingCompetitions = await this.competitionRepository.findOneBySeasonId(
      validatedConfig.activeSeason.id
    )

    if (existingCompetitions && existingCompetitions.length > 0) {
      // Verificar si es el mismo tipo de competición
      const isCreatingLeagues = isLeaguesRules(validatedConfig)
      const isCreatingKempesCup = isKempesCupRules(validatedConfig)
      const isCreatingCindorCup = isCindorCupRules(validatedConfig)
      const isCreatingSuperCup = isSuperCupRules(validatedConfig)

      // Obtener los tipos de las competiciones existentes
      const existingTypeNames = await Promise.all(
        existingCompetitions.map(async (comp) => {
          const type = await this.competitionTypeRepository.findOneById(comp.competitionTypeId)
          return type?.name
        })
      )

      const hasExistingLeagues = existingTypeNames.some(name =>
        name && ['LEAGUE_A', 'LEAGUE_B', 'LEAGUE_C', 'LEAGUE_D', 'LEAGUE_E'].includes(name.toString())
      )
      const hasExistingKempesCup = existingTypeNames.some(name => name === 'KEMPES_CUP')
      const hasExistingCindorCup = existingTypeNames.some(name => name === 'CINDOR_CUP')
      const hasExistingSuperCup = existingTypeNames.some(name => name === 'SUPER_CUP')

      // Solo bloquear si ya existe el mismo tipo específico
      if (isCreatingLeagues && hasExistingLeagues) {
        throw new CompetitionAlreadyExistsError()
      }
      if (isCreatingKempesCup && hasExistingKempesCup) {
        throw new CompetitionAlreadyExistsError()
      }
      if (isCreatingCindorCup && hasExistingCindorCup) {
        throw new CompetitionAlreadyExistsError()
      }
      if (isCreatingSuperCup && hasExistingSuperCup) {
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

    // Copa Cindor (Kempesitas - eliminación directa)
    if (isCindorCupRules(validatedConfig)) {
      const cindorConfig = validatedConfig as CindorCupRules

      const result = await this.prisma.$transaction(async (tx) => {
        // Crear competición
        const competition = await tx.competition.create({
          data: {
            name: `Copa Cindor - T${cindorConfig.activeSeason.number}`,
            system: CompetitionStage.KNOCKOUT,
            competitionTypeId: cindorConfig.competitionType.id,
            seasonId: cindorConfig.activeSeason.id,
            isActive: true,
            rules: cindorConfig as unknown as Prisma.InputJsonValue,
          },
        })

        // Generar fixtures de eliminación directa con linking correcto
        const createdMatches = await this.createDirectKnockoutMatchesInTransaction(
          tx,
          competition.id,
          cindorConfig.teamIds
        )

        return {
          success: true,
          competitions: [competition],
          fixtures: [{ competition, matchesCreated: createdMatches.length, matches: createdMatches }],
        }
      }, { timeout: 60000 })

      return result
    }

    // Supercopa (6 equipos - mixta, sin categoría)
    if (isSuperCupRules(validatedConfig)) {
      const superConfig = validatedConfig as SuperCupRules

      const result = await this.prisma.$transaction(async (tx) => {
        // Crear competición
        const competition = await tx.competition.create({
          data: {
            name: `Supercopa - T${superConfig.activeSeason.number}`,
            system: CompetitionStage.KNOCKOUT,
            competitionTypeId: superConfig.competitionType.id,
            seasonId: superConfig.activeSeason.id,
            isActive: true,
            rules: superConfig as unknown as Prisma.InputJsonValue,
          },
        })

        // Generar fixtures de eliminación directa con linking correcto
        const createdMatches = await this.createDirectKnockoutMatchesInTransaction(
          tx,
          competition.id,
          superConfig.teamIds
        )

        return {
          success: true,
          competitions: [competition],
          fixtures: [{ competition, matchesCreated: createdMatches.length, matches: createdMatches }],
        }
      }, { timeout: 60000 })

      return result
    }

    throw new Error('Invalid competition configuration')
  }

  async updateCompetition(id: string, config: CompetitionRules) {
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

    // Eliminar en transacción: primero matches relacionados, luego la competición
    await this.prisma.$transaction(async (tx) => {
      // Eliminar COVIDs de los matches de esta competición
      await tx.matchCovid.deleteMany({
        where: {
          match: {
            competitionId: id
          }
        }
      })

      // Eliminar matches de esta competición
      await tx.match.deleteMany({
        where: { competitionId: id }
      })

      // Eliminar la competición
      await tx.competition.delete({
        where: { id }
      })
    })
  }

  /**
   * Genera la estructura vacía del bracket para mostrar en el frontend
   * No crea nada en la base de datos
   */
  getBracketStructure(teamCount: number): EmptyBracketStructure {
    return generateEmptyBracketStructure(teamCount)
  }

  /**
   * Crea una Supercopa con posicionamiento manual de equipos
   */
  async createSupercupWithPlacements(config: {
    seasonId: string
    competitionTypeId: string
    teamPlacements: BracketTeamPlacement[]
  }) {
    // Extraer team IDs de los placements
    const teamIds = [...new Set(config.teamPlacements.map(p => p.teamId))]

    // Validar que sean exactamente 6 equipos
    if (teamIds.length !== 6) {
      throw new Error(`Supercopa requires exactly 6 teams, got ${teamIds.length}`)
    }

    const season = await this.prisma.season.findUnique({ where: { id: config.seasonId } })
    if (!season) {
      throw new Error('Season not found')
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Crear competición
      const competition = await tx.competition.create({
        data: {
          name: `Supercopa - T${season.number}`,
          system: CompetitionStage.KNOCKOUT,
          competitionTypeId: config.competitionTypeId,
          seasonId: config.seasonId,
          isActive: true,
          rules: {
            type: 'SUPER_CUP',
            teamCount: 6,
            teamPlacements: config.teamPlacements,
          } as unknown as Prisma.InputJsonValue,
        },
      })

      // Generar fixtures con placements manuales
      const createdMatches = await this.createDirectKnockoutMatchesInTransaction(
        tx,
        competition.id,
        teamIds,
        config.teamPlacements
      )

      return {
        success: true,
        competitions: [competition],
        fixtures: [{ competition, matchesCreated: createdMatches.length, matches: createdMatches }],
      }
    }, { timeout: 60000 })

    return result
  }

  /**
   * Crea una Copa Cindor con posicionamiento manual de equipos
   */
  async createCindorWithPlacements(config: {
    seasonId: string
    competitionTypeId: string
    teamPlacements: BracketTeamPlacement[]
  }) {
    // Extraer team IDs de los placements
    const teamIds = [...new Set(config.teamPlacements.map(p => p.teamId))]

    const season = await this.prisma.season.findUnique({ where: { id: config.seasonId } })
    if (!season) {
      throw new Error('Season not found')
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Crear competición
      const competition = await tx.competition.create({
        data: {
          name: `Copa Cindor - T${season.number}`,
          system: CompetitionStage.KNOCKOUT,
          competitionTypeId: config.competitionTypeId,
          seasonId: config.seasonId,
          isActive: true,
          rules: {
            type: 'CINDOR_CUP',
            teamCount: teamIds.length,
            teamPlacements: config.teamPlacements,
          } as unknown as Prisma.InputJsonValue,
        },
      })

      // Generar fixtures con placements manuales
      const createdMatches = await this.createDirectKnockoutMatchesInTransaction(
        tx,
        competition.id,
        teamIds,
        config.teamPlacements
      )

      return {
        success: true,
        competitions: [competition],
        fixtures: [{ competition, matchesCreated: createdMatches.length, matches: createdMatches }],
      }
    }, { timeout: 60000 })

    return result
  }

  /**
   * Crea partidos de knockout directo dentro de una transacción
   * Maneja correctamente las conexiones entre rondas y los BYEs
   */
  private async createDirectKnockoutMatchesInTransaction(
    tx: Prisma.TransactionClient,
    competitionId: string,
    teamIds: string[],
    teamPlacements?: BracketTeamPlacement[]
  ): Promise<Match[]> {
    const bracketResult = generateDirectKnockoutBracket(competitionId, teamIds, teamPlacements)
    const { matchesByRound, roundOrder, startRoundIndex } = bracketResult

    // Map para guardar: round_position -> matchId (para linking)
    const matchIdMap = new Map<string, string>()
    // Map para guardar: round_position -> byeTeamId (para propagar a siguiente ronda)
    const byeTeamMap = new Map<string, string>()

    const createdMatches: Match[] = []

    // Crear partidos ronda por ronda
    for (let roundIdx = startRoundIndex; roundIdx < roundOrder.length; roundIdx++) {
      const currentRound = roundOrder[roundIdx]
      const roundMatches = matchesByRound.get(currentRound) || []
      const isFirstRound = roundIdx === startRoundIndex

      for (const bracketMatch of roundMatches) {
        const { match, round, position, isBye, byeTeamId } = bracketMatch
        const key = `${round}_${position}`

        // Limpiar match data (remover undefined)
        const cleanedMatch: any = { ...match }
        if (!cleanedMatch.homeClub) delete cleanedMatch.homeClub
        if (!cleanedMatch.awayClub) delete cleanedMatch.awayClub

        if (!isFirstRound) {
          // Rondas posteriores: establecer sourceMatchId
          const prevRound = roundOrder[roundIdx - 1]
          const homeSourcePosition = position * 2 - 1
          const awaySourcePosition = position * 2

          const homeSourceKey = `${prevRound}_${homeSourcePosition}`
          const awaySourceKey = `${prevRound}_${awaySourcePosition}`

          const homeSourceMatchId = matchIdMap.get(homeSourceKey)
          const awaySourceMatchId = matchIdMap.get(awaySourceKey)

          const homeByeTeamId = byeTeamMap.get(homeSourceKey)
          const awayByeTeamId = byeTeamMap.get(awaySourceKey)

          // Si home viene de un BYE, asignar el equipo directamente
          if (homeByeTeamId) {
            cleanedMatch.homeClub = { connect: { id: homeByeTeamId } }
            cleanedMatch.homePlaceholder = null
          } else if (homeSourceMatchId) {
            cleanedMatch.homeSourceMatch = { connect: { id: homeSourceMatchId } }
            cleanedMatch.homeSourcePosition = 'WINNER'
          }

          // Si away viene de un BYE, asignar el equipo directamente
          if (awayByeTeamId) {
            cleanedMatch.awayClub = { connect: { id: awayByeTeamId } }
            cleanedMatch.awayPlaceholder = null
          } else if (awaySourceMatchId) {
            cleanedMatch.awaySourceMatch = { connect: { id: awaySourceMatchId } }
            cleanedMatch.awaySourcePosition = 'WINNER'
          }
        }

        // Crear el partido
        const createdMatch = await tx.match.create({ data: cleanedMatch })
        matchIdMap.set(key, createdMatch.id)
        createdMatches.push(createdMatch)

        // Si es BYE, guardar el equipo para propagarlo a la siguiente ronda
        if (isBye && byeTeamId) {
          byeTeamMap.set(key, byeTeamId)
        }
      }
    }

    return createdMatches
  }
}
