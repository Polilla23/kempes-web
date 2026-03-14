import { PrismaClient, KnockoutRound } from '@prisma/client'
import { IPlazoRepository, PlazoWithScopes, PlazoWithScopesAndMatches } from './interfaces/IPlazoRepository'

const PLAZO_INCLUDE_SCOPES = {
  scopes: {
    include: {
      competition: {
        select: { id: true, name: true, system: true },
      },
    },
    orderBy: { competition: { name: 'asc' as const } },
  },
} as const

export class PlazoRepository implements IPlazoRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findBySeasonHalfId(seasonHalfId: string): Promise<PlazoWithScopes[]> {
    return await this.prisma.plazo.findMany({
      where: { seasonHalfId },
      include: {
        ...PLAZO_INCLUDE_SCOPES,
        matches: { select: { id: true, status: true } },
      },
      orderBy: { order: 'asc' },
    }) as any
  }

  async findBySeasonId(seasonId: string): Promise<PlazoWithScopes[]> {
    return await this.prisma.plazo.findMany({
      where: {
        seasonHalf: { seasonId },
      },
      include: {
        ...PLAZO_INCLUDE_SCOPES,
        matches: { select: { id: true, status: true } },
        seasonHalf: { select: { id: true, halfType: true, seasonId: true } },
      },
      orderBy: [
        { seasonHalf: { halfType: 'asc' } },
        { order: 'asc' },
      ],
    }) as any
  }

  async findOneById(id: string): Promise<PlazoWithScopesAndMatches | null> {
    return await this.prisma.plazo.findUnique({
      where: { id },
      include: {
        ...PLAZO_INCLUDE_SCOPES,
        matches: { select: { id: true, status: true } },
        seasonHalf: { select: { id: true, halfType: true, seasonId: true } },
      },
    }) as any
  }

  async updateIsOpen(id: string, isOpen: boolean) {
    return await this.prisma.plazo.update({
      where: { id },
      data: { isOpen },
      include: {
        ...PLAZO_INCLUDE_SCOPES,
        matches: { select: { id: true, status: true } },
      },
    }) as any
  }

  async save(data: {
    seasonHalfId: string
    title: string
    deadline: Date
    order: number
    isOpen?: boolean
    scopes: Array<{
      competitionId: string
      matchdayFrom?: number | null
      matchdayTo?: number | null
      knockoutRounds?: string[]
    }>
  }): Promise<PlazoWithScopes> {
    return await this.prisma.plazo.create({
      data: {
        seasonHalfId: data.seasonHalfId,
        title: data.title,
        deadline: data.deadline,
        order: data.order,
        isOpen: data.isOpen ?? false,
        scopes: {
          create: data.scopes.map((s) => ({
            competitionId: s.competitionId,
            matchdayFrom: s.matchdayFrom ?? null,
            matchdayTo: s.matchdayTo ?? null,
            knockoutRounds: (s.knockoutRounds || []) as KnockoutRound[],
          })),
        },
      },
      include: PLAZO_INCLUDE_SCOPES,
    }) as any
  }

  async updateOneById(
    id: string,
    data: {
      title?: string
      deadline?: Date
      order?: number
      scopes?: Array<{
        competitionId: string
        matchdayFrom?: number | null
        matchdayTo?: number | null
        knockoutRounds?: string[]
      }>
    }
  ): Promise<PlazoWithScopes> {
    return await this.prisma.$transaction(async (tx) => {
      // If scopes are provided, delete old ones and create new
      if (data.scopes) {
        await tx.plazoScope.deleteMany({ where: { plazoId: id } })
      }

      const updateData: any = {}
      if (data.title !== undefined) updateData.title = data.title
      if (data.deadline !== undefined) updateData.deadline = data.deadline
      if (data.order !== undefined) updateData.order = data.order
      if (data.scopes) {
        updateData.scopes = {
          create: data.scopes.map((s) => ({
            competitionId: s.competitionId,
            matchdayFrom: s.matchdayFrom ?? null,
            matchdayTo: s.matchdayTo ?? null,
            knockoutRounds: (s.knockoutRounds || []) as KnockoutRound[],
          })),
        }
      }

      return await tx.plazo.update({
        where: { id },
        data: updateData,
        include: PLAZO_INCLUDE_SCOPES,
      })
    }) as any
  }

  async deleteOneById(id: string) {
    return await this.prisma.plazo.delete({ where: { id } })
  }

  async assignMatchesToPlazo(plazoId: string, matchIds: string[]): Promise<number> {
    if (matchIds.length === 0) return 0
    const result = await this.prisma.match.updateMany({
      where: { id: { in: matchIds } },
      data: { plazoId },
    })
    return result.count
  }

  async clearMatchAssignments(plazoId: string): Promise<number> {
    const result = await this.prisma.match.updateMany({
      where: { plazoId },
      data: { plazoId: null },
    })
    return result.count
  }

  async getMatchesForScope(
    competitionId: string,
    matchdayFrom?: number | null,
    matchdayTo?: number | null,
    knockoutRounds?: string[]
  ) {
    const where: any = { competitionId }

    if (matchdayFrom != null && matchdayTo != null) {
      where.stage = 'ROUND_ROBIN'
      where.matchdayOrder = {
        gte: matchdayFrom,
        lte: matchdayTo,
      }
    } else if (knockoutRounds && knockoutRounds.length > 0) {
      where.stage = 'KNOCKOUT'
      where.knockoutRound = { in: knockoutRounds }
    }

    return await this.prisma.match.findMany({
      where,
      select: { id: true },
    })
  }

  async getOverdueReport(seasonId: string) {
    const now = new Date()

    const plazos = await this.prisma.plazo.findMany({
      where: {
        seasonHalf: { seasonId },
        deadline: { lt: now },
      },
      include: {
        matches: {
          where: { status: 'PENDIENTE' },
          include: {
            homeClub: { select: { id: true, name: true, logo: true } },
            awayClub: { select: { id: true, name: true, logo: true } },
            competition: {
              select: {
                id: true,
                name: true,
                competitionType: { select: { name: true, category: true } },
              },
            },
          },
        },
        seasonHalf: { select: { halfType: true } },
      },
      orderBy: [
        { seasonHalf: { halfType: 'asc' } },
        { order: 'asc' },
      ],
    })

    return plazos.filter((p) => p.matches.length > 0)
  }
}
