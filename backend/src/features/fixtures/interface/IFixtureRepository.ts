import { Match, Prisma } from "@prisma/client";

export interface IFixtureRepository {
    createMatch(data: Prisma.MatchCreateInput): Promise<Match>;
    createManyMatches(data: Prisma.MatchCreateInput[]): Promise<number>;

    findAll(): Promise<Match[]>;
    findById(id: string): Promise<Match | null>;
    findMatchesDependingOn(id: string): Promise<Match[]>;
    getMatchesByCompetition(id: string): Promise<Match[]>;
    getKnockoutBracket(id: string): Promise<Match[]>;
    getGroupStageMatches(id: string): Promise<Match[]>;

    updateMatch(id: string, data: Prisma.MatchUpdateInput): Promise<Match>;
}