import { Competition, CompetitionStage, PrismaClient } from '@prisma/client'
import { ICompetitionRepository } from '@/features/competitions/interface/ICompetitionRepository'
import { isKempesCupRules, isLeaguesRules } from '@/features/utils/jsonTypeChecker'
import type { KempesCupRules, LeaguesRules } from '@/types'

export class CompetitionRepository implements ICompetitionRepository {
  private prisma: PrismaClient
  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async save(config: LeaguesRules | KempesCupRules): Promise<Competition[]> {
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
              rules: league,
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
          system: CompetitionStage.ROUND_ROBIN,
          competitionTypeId: kempesCupConfig.competitionType.id,
          seasonId: kempesCupConfig.activeSeason.id,
          isActive: true,
          rules: kempesCupConfig,
        },
      })
      return [competition]
    } else {
      throw new Error('Invalid competition configuration')
    }
  }
  async updateOneById(id: string, config: LeaguesRules | KempesCupRules): Promise<Competition> {
    const updatedCompetition = await this.prisma.competition.update({
      where: { id },
      data: { rules: config },
    })
    return updatedCompetition
  }
  async deleteOneById(id: string): Promise<void> {
    await this.prisma.competition.delete({
      where: { id },
    })
  }
  async findAll(): Promise<Competition[] | null> {
    return await this.prisma.competition.findMany()
  }
  async findOneById(id: string): Promise<Competition | null> {
    return await this.prisma.competition.findUnique({
      where: { id },
    })
  }
  async findOneBySeasonId(seasonId: string): Promise<Competition[] | null> {
    return await this.prisma.competition.findMany({
      where: { seasonId },
    })
  }
}
