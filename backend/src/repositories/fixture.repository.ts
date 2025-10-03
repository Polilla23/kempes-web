import { PrismaClient, Match, CompetitionStage, Prisma } from '@prisma/client'
import { IFixtureRepository } from '../interfaces/IFixtureRepository'

export class FixtureRepository implements IFixtureRepository {
    constructor(private prisma: PrismaClient) {}

    async createMatch(data: Prisma.MatchCreateInput): Promise<Match> {
        return this.prisma.match.create({
            data,
            include: {
                homeClub: true,
                awayClub: true,
                competition: true,
                homeSourceMatch: true,
                awaySourceMatch: true,
            },
        })
    }

    async createManyMatches(data: Prisma.MatchCreateInput[]): Promise<number> {
        const results = await this.prisma.$transaction(
            data.map(matchData => this.prisma.match.create({ data: matchData }))
        )
        return results.length
    }

    async findAll(): Promise<Match[]> {
        return this.prisma.match.findMany({
            include: {
                homeClub: true,
                awayClub: true,
                competition: true,
                homeSourceMatch: true,
                awaySourceMatch: true,
            },
        })
    }

    async findById(id: string): Promise<Match | null> {
        return this.prisma.match.findUnique({
            where: { id },
            include: {
                homeClub: true,
                awayClub: true,
                competition: true,
                homeSourceMatch: {
                    include: {
                        homeClub: true,
                        awayClub: true,
                    }
                },
                awaySourceMatch: {
                    include: {
                        homeClub: true,
                        awayClub: true,
                    }
                },
                homeNextMatches: true,
                dependentMatches: true,
            },
        })
    }

    async findMatchesDependingOn(id: string): Promise<Match[]> {
        const match = await this.prisma.match.findUnique({
            where: { id },
            include: {
                homeNextMatches: {
                    include: {
                        homeClub: true,
                        awayClub: true,
                        competition: true,
                    }
                },
                dependentMatches: {
                    include: {
                        homeClub: true,
                        awayClub: true,
                        competition: true,
                    }
                }
            }
        })

        if (!match) return []

        const uniqueDependents = [
            ...match.homeNextMatches,
            ...match.dependentMatches
        ]

        return uniqueDependents
    }

    async getMatchesByCompetition(id: string): Promise<Match[]> {
        return await this.prisma.match.findMany({
            where: { id },
            include: {
                homeClub: true,
                awayClub: true,
                competition: true,
            },
            orderBy: [
                { matchdayOrder: 'asc' },
                { id: 'asc' }
            ]
        })
    }

    async getKnockoutBracket(id: string): Promise<Match[]> {
        return await this.prisma.match.findMany({
            where: {
                competitionId: id,
                stage: CompetitionStage.KNOCKOUT
            },
            include: {
                homeClub: true,
                awayClub: true,
                homeSourceMatch: {
                    include: {
                        homeClub: true,
                        awayClub: true,
                    }
                },
                awaySourceMatch: {
                    include: {
                        homeClub: true,
                        awayClub: true,
                    }
                },
            },
            orderBy: [
                { matchdayOrder: 'desc' },
                { id: 'asc' }
            ]
        })
    }

    async getGroupStageMatches(id: string): Promise<Match[]> {
        return await this.prisma.match.findMany({
            where: {
                competitionId: id,
                stage: CompetitionStage.ROUND_ROBIN
            },
            include: {
                homeClub: true,
                awayClub: true,
                competition: true,
            },
            orderBy: [
                { matchdayOrder: 'asc' },
                { id: 'asc' }
            ]
        })
    }

    async updateMatch(id: string, data: Prisma.MatchUpdateInput): Promise<Match> {
        return this.prisma.match.update({
            where: { id },
            data,
            include: {
                homeClub: true,
                awayClub: true,
                competition: true,
            }
        })
    }
}