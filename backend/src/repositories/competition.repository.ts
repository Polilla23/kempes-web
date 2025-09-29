import { Competition, CompetitionStage, PrismaClient } from '@prisma/client'
import { ICompetitionRepository } from '../interfaces/ICompetitionRepository'
import { isKempesCupRules, isLeaguesRules } from '../utils/jsonTypeChecker'
import type { KempesCupRules, LeaguesRules } from '../utils/types'

export class CompetitionRepository implements ICompetitionRepository {
  private prisma: PrismaClient
  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async save(config: LeaguesRules | KempesCupRules): Promise<void> {
    if (isLeaguesRules(config)) {
      return this.prisma.$transaction(async (tx) => {
        for (const league of config.leagues) {
          await tx.competition.create({
            data: {
              name: `${league.active_league.name} ${config.competitionCategory} - T${config.activeSeason.number}`,
              system: CompetitionStage.ROUND_ROBIN,
              competitionTypeId: league.active_league.id,
              seasonId: config.activeSeason.id,
              isActive: true,
              rules: league,
            },
          })
        }
      })
    } else if (isKempesCupRules(config)) {
      await this.prisma.competition.create({
        data: {
          name: `${config.competitionType.name} ${config.competitionCategory} - T${config.activeSeason.number}`,
          system: CompetitionStage.ROUND_ROBIN,
          competitionTypeId: config.competitionType.id,
          seasonId: config.activeSeason.id,
          isActive: true,
          rules: config,
        },
      })
    } else {
      throw new Error('Invalid competition configuration')
    }
  }
  async updateOneById(id: string, config: LeaguesRules | KempesCupRules): Promise<void> {
    await this.prisma.competition.update({
      where: { id },
      data: { rules: config },
    })
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
