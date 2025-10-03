import { Prisma, CompetitionStage, MatchStatus } from "@prisma/client";
import { BracketMatch } from "./types";
import { match } from "assert";

/**
 * Sort brackets by round order to ensure proper creation sequence.
 * 
 * Why? We must create quarter-finals before semi-finals, etc.
 * 
 * Example order:
 * 1. ROUND_OF_16 (if exists)
 * 2. QUARTERFINAL
 * 3. SEMIFINAL
 * 4. FINAL
 */
export function sortBracketsByRound(brackets: BracketMatch[]): BracketMatch[] {
    const roundOrder: Record<string, number> = {
        ROUND_OF_16: 1,
        QUARTER_FINALS: 2,
        SEMI_FINALS: 3,
        FINALS: 4,
    }

    return brackets.sort((a, b) => {
        const orderDiff = roundOrder[a.round] - roundOrder[b.round];
        if (orderDiff !== 0) return orderDiff;
        // If same round, sort by position (QF1 before QF2, etc.)
        return a.position - b.position;
    });
}

/**
 * Convert round name to matchdayOrder number.
 * 
 * Used for database sorting and display order
 * Higher number = earlier round
 * 
 * Why descending? Because in Prisma queries we order by matchdayOrder DESC
 * to show Final first, then Semifinals, etc.
*/
export function getRoundOder(round: string): number {
    const orderMap: Record<string, number> = {
        ROUND_OF_16: 16,
        QUARTER_FINALS: 8,
        SEMI_FINALS: 4,
        FINALS: 2,
    }
    return orderMap[round] || 1
}

/** 
 * Generate human-readable placeholder text for UI display knockout matches.
 * 
 * Examples:
 * - "WINNER_QUARTERFINAL_1" -> "Winner of Quarterfinal 1"
 * - "LOSER_SEMIFINAL_2" -> "Loser of Semifinal 2"
 * - "GROUP_A_1" -> "1st Place Group A"
 *
 * Returns null if team is directly assigned (no placeholder needed)
*/
export function generatePlaceholder(team: BracketMatch['homeTeam']): string | null {
    if (team.type === 'DIRECT') {
        // Team is already assigned, no placeholder needed
        return null;
    }

    if (team.type === 'FROM_GROUP') {
        // Team comes from group stage classification
        // Example: "GROUP_A_1", "GROUP_B_2"
        return team.groupReference || null
    }

    if (team.type === 'FROM_MATCH' && team.sourceRound && team.sourcePosition) {
        // Team comes from previous knockout match
        // Format: "WINNER_QUARTERFINAL_1" or "WINNER_SEMIFINAL_2"
        return `${team.sourceClubPosition}_${team.sourceRound}_${team.sourcePosition}`;
    }

    return null
}

/**
 * Build complete match data object for Prisma creation.
 * 
 * This is THE CORE function that handles all three team source types:
 * 
 * 1. DIRECT: Team is already known (Club A vs Club B)
 * 2. FROM_MATCH: Team comes from previous knockout match (Winner of QF1 vs Winner of QF2)
 * 3. FROM_GROUP: Team comes from group stage ranking (1st Place Group A vs 2nd Place Group B)
 * 
 * The magic happens with homeSourceMatchId and awaySourceMatchId:
 * - These fields create the dependecy chain
 * - when source match finishes, this match gets updated automatically
 * 
 * @param competitionId - ID of the competition
 * @param bracket - The bracket configuration from frontend
 * @param matchIdMap - Map of round_position -> matchId (for referencing prevoius matches)
 */
export function buildKnockoutMatchData(
    bracket: BracketMatch,
    competitionId: string,
    matchIdMap: Map<string, string>
): Prisma.MatchCreateInput {
    const matchData: Prisma.MatchCreateInput = {
        competition: {
            connect: { id: competitionId }
        },
        matchdayOrder: getRoundOder(bracket.round),
        stage: CompetitionStage.KNOCKOUT,
        status: MatchStatus.PENDIENTE,

        // ================= DIRECT TEAM ASSIGNMENT =================
        // If homeTeam iks type DIRECT and has clubId, connect it directly
        ...(bracket.homeTeam.type === 'DIRECT' && bracket.homeTeam.clubId && {
            homeClub: {
                connect: { id: bracket.homeTeam.clubId }
            }
        }),

        // If awayTeam is type DIRECT and has clubId, connect it directly
        ...(bracket.awayTeam.type === 'DIRECT' && bracket.awayTeam.clubId && {
            awayClub: {
                connect: { id: bracket.awayTeam.clubId }
            }
        }),

        // ================= PLACEHOLDER TEXT =================
        // Generate human-readable text for UI display
        // Examples: "Winner of Quarterfinal 1", "1st Place Group A"
        homePlaceholder: generatePlaceholder(bracket.homeTeam),
        awayPlaceholder: generatePlaceholder(bracket.awayTeam),

        // ================= SOURCE MATCH LINKS =================
        // If homeTeam comes FROM_MATCH, link it to the source match
        ...(bracket.homeTeam.type === 'FROM_MATCH' &&
            bracket.homeTeam.sourceRound &&
            bracket.homeTeam.sourcePosition && {
                homeSourceMatch: {
                    connect: {
                        // Look up the match ID from previous round
                        // Example: QUATERFINAL_1 -> matchId
                        id: matchIdMap.get(
                            `${bracket.homeTeam.sourceRound}_${bracket.homeTeam.sourcePosition}`
                        )!
                    }
                },
                homeSourcePosition: bracket.homeTeam.sourcePosition.toString()
            }),

        // If awayTeam comes FROM_MATCH, link it to the source match
        ...(bracket.awayTeam.type === 'FROM_MATCH' &&
            bracket.awayTeam.sourceRound &&
            bracket.awayTeam.sourcePosition && {
                awaySourceMatch: {
                    connect: {
                        id: matchIdMap.get(
                            `${bracket.awayTeam.sourceRound}_${bracket.awayTeam.sourcePosition}`
                        )!
                    }
                },
                awaySourcePosition: bracket.awayTeam.sourcePosition.toString()
            })
    }

    return matchData
}