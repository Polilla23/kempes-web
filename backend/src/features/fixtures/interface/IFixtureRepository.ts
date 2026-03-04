import { Match, Prisma } from "@prisma/client";

export interface IFixtureRepository {
    createMatch(data: Prisma.MatchCreateInput): Promise<Match>;
    createManyMatches(data: Prisma.MatchCreateInput[]): Promise<Match[]>;

    findAll(): Promise<Match[]>;
    findById(id: string): Promise<Match | null>;
    findByIdForSubmit(id: string): Promise<Match | null>;
    findMatchesDependingOn(id: string): Promise<Match[]>;
    getMatchesByCompetition(id: string): Promise<Match[]>;
    getMatchesWithFilters(seasonId?: string, competitionId?: string): Promise<Match[]>;
    getKnockoutBracket(id: string): Promise<Match[]>;
    getGroupStageMatches(id: string): Promise<Match[]>;
    findByIdWithRawEvents(id: string): Promise<Match | null>;

    updateMatch(id: string, data: Prisma.MatchUpdateInput): Promise<Match>;
    
    // COVID methods
    getActivePlayers(clubId: string): Promise<any[]>;
    createCovidRecords(records: { matchId: string; playerId: string; clubId: string }[]): Promise<any>;
    getMatchCovids(matchId: string): Promise<any[]>;
}