import { Competition, CompetitionStage, PrismaClient, Prisma } from '@prisma/client'
import { ICompetitionRepository } from '@/features/competitions/interface/ICompetitionRepository'
import { isKempesCupRules, isLeaguesRules, isCindorCupRules, isSuperCupRules } from '@/features/utils/jsonTypeChecker'
import type { KempesCupRules, LeaguesRules, CindorCupRules, SuperCupRules, CompetitionRules } from '@/types'

export class CompetitionRepository implements ICompetitionRepository {
  private prisma: PrismaClient
  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async save(config: CompetitionRules): Promise<Competition[]> {
    if (isLeaguesRules(config)) {
      // Para leagues, creamos múltiples competencias y retornamos todas
      const createdCompetitions: Competition[] = []
      await this.prisma.$transaction(async (tx) => {
        for (const league of (config as LeaguesRules).leagues) {
          const competition = await tx.competition.create({
            data: {
              name: `${league.active_league.name} ${config.competitionCategory} - T${config.activeSeason.number}`,
              system: CompetitionStage.ROUND_ROBIN,
              competitionTypeId: league.active_league.id,
              seasonId: config.activeSeason.id,
              isActive: true,
              rules: league as unknown as Prisma.InputJsonValue,
            },
          })
          createdCompetitions.push(competition)
        }
      })
      return createdCompetitions
    } else if (isKempesCupRules(config)) {
      const kempesCupConfig = config as KempesCupRules
      const competition = await this.prisma.competition.create({
        data: {
          name: `${kempesCupConfig.competitionType.name} ${kempesCupConfig.competitionCategory} - T${kempesCupConfig.activeSeason.number}`,
          // Copa Kempes should start as group stage (ROUND_ROBIN). Knockout phases are separate competitions.
          system: CompetitionStage.ROUND_ROBIN,
          competitionTypeId: kempesCupConfig.competitionType.id,
          seasonId: kempesCupConfig.activeSeason.id,
          isActive: true,
          rules: kempesCupConfig as unknown as Prisma.InputJsonValue,
        },
      })
      return [competition]
    } else if (isCindorCupRules(config)) {
      // Copa Cindor: Eliminación directa para Kempesitas
      const cindorConfig = config as CindorCupRules
      const competition = await this.prisma.competition.create({
        data: {
          name: `Copa Cindor - T${cindorConfig.activeSeason.number}`,
          system: CompetitionStage.KNOCKOUT,
          competitionTypeId: cindorConfig.competitionType.id,
          seasonId: cindorConfig.activeSeason.id,
          isActive: true,
          rules: cindorConfig as unknown as Prisma.InputJsonValue,
        },
      })
      return [competition]
    } else if (isSuperCupRules(config)) {
      // Supercopa: Eliminación directa con 6 equipos (mixta - sin categoría)
      const superConfig = config as SuperCupRules
      const competition = await this.prisma.competition.create({
        data: {
          name: `Supercopa - T${superConfig.activeSeason.number}`,
          system: CompetitionStage.KNOCKOUT,
          competitionTypeId: superConfig.competitionType.id,
          seasonId: superConfig.activeSeason.id,
          isActive: true,
          rules: superConfig as unknown as Prisma.InputJsonValue,
        },
      })
      return [competition]
    } else {
      throw new Error('Invalid competition configuration')
    }
  }
  async updateOneById(id: string, config: CompetitionRules): Promise<Competition> {
    const updatedCompetition = await this.prisma.competition.update({
      where: { id },
      data: { rules: config as unknown as Prisma.InputJsonValue },
    })
    return updatedCompetition
  }
  async updateIsActive(id: string, isActive: boolean): Promise<Competition> {
    return await this.prisma.competition.update({
      where: { id },
      data: { isActive },
    })
  }
  async deleteOneById(id: string): Promise<void> {
    await this.prisma.competition.delete({
      where: { id },
    })
  }
  async findAll() {
    return await this.prisma.competition.findMany({
      include: { competitionType: true }
    })
  }
  async findOneById(id: string): Promise<Competition | null> {
    return await this.prisma.competition.findUnique({
      where: { id },
    })
  }
  
  async findOneByIdWithType(id: string) {
    return await this.prisma.competition.findUnique({
      where: { id },
      include: { competitionType: true }
    })
  }
  
  async findOneBySeasonId(seasonId: string) {
    return await this.prisma.competition.findMany({
      where: { seasonId },
      include: { competitionType: true }
    })
  }
}
