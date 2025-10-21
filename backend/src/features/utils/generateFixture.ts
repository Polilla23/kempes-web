import { Prisma, CompetitionStage, MatchStatus } from '@prisma/client';

/** 
 * Generate round-robin fixtures (league style)
 * 
 * Algorithm: Round-robin rotation
 * - Fixes one team (first position)
 * - Rotates all other teams
 * - Creates balanced matchdays
 * 
 * @params clubs - Array of club IDs
 * @params competitionId - Competition ID
 * @params rematch - If true, creates home & away fixtures (double round-robin)
*/
export function generateLeagueFixture(
    clubs: string[], 
    competitionId: string, 
    rematch: boolean
): Prisma.MatchCreateInput[] {
    const matches: Prisma.MatchCreateInput[] = []
    let matchdayOrder = 1
    let rotation = [...clubs]

    // First round (or only round if no rematch)
    for (let i = 0; i < clubs.length - 1; i++) {
      // Create matches for this matchday
      for (let j = 0; j < rotation.length - 1; j += 2) {
        matches.push({
          competition: { connect: { id: competitionId } },
          homeClub: { connect: { id: rotation[j] } },
          awayClub: { connect: { id: rotation[j + 1] } },
          matchdayOrder,
          stage: CompetitionStage.ROUND_ROBIN,
          status: MatchStatus.PENDIENTE
        })
      }

      matchdayOrder++

      // Rotate teams (keep first fixed, rotate rest)
      rotation = [rotation[0], ...rotation.slice(2), rotation[1]]
    }

    // Second round (reserve fixtures)
    if (rematch) {
      const firstRoundMatches = [...matches]
      for (const match of firstRoundMatches) {
        matches.push({
          competition: match.competition,
          homeClub: match.awayClub,
          awayClub: match.homeClub,
          matchdayOrder,
          stage: CompetitionStage.ROUND_ROBIN,
          status: MatchStatus.PENDIENTE
        })
        matchdayOrder++
      }
    }

    return matches
}

/**
 * Generate round-robin fixtures within a group (cup style)
 * Each team plays every other team once
 * 
 * @params clubIds - Array of club IDs in the group
 * @params competitionId - Competition ID
 * @params groupName - Group identifier (e.g. "GROUP_A")
 */
export function generateGroupStageFixture(
  clubIds: string[],
  competitionId: string,
  groupName: string
): Prisma.MatchCreateInput[] {
  const matches: Prisma.MatchCreateInput[] = [];
  let matchdayOrder = 1;

  // Each team plays every other team once
  for (let i = 0; i < clubIds.length; i++) {
    for (let j = i + 1; j < clubIds.length; j++) {
      matches.push({
        competition: { connect: { id: competitionId } },
        homeClub: { connect: { id: clubIds[i] } },
        awayClub: { connect: { id: clubIds[j] } },
        matchdayOrder,
        stage: CompetitionStage.ROUND_ROBIN,
        status: MatchStatus.PENDIENTE,
        homePlaceholder: null,
        awayPlaceholder: null,
      })

      matchdayOrder++;
    }
  }

  return matches
}

// function generateFixture({
//   seasonId,
//   competitionId,
//   clubs,
//   rematchs,
// }: {
//   seasonId: number
//   competitionId: number
//   clubs: any[]
//   rematchs: boolean
// }) {
//   const fixture = {
//     season: seasonId,
//     competition: competitionId,
//     matchDays: [] as Array<{
//       matchDay: number
//       combinations: Array<[string, string]>
//     }>,
//   }

//   let rotation = [...clubs]

//   for (let i = 0; i < clubs.length - 1; i += 1) {
//     const matchDay = {
//       matchDay: i + 1,
//       combinations: [] as Array<[string, string]>,
//     }
//     for (let j = 0; j < rotation.length - 1; j += 2) {
//       const combination: [string, string] = [rotation[j], rotation[j + 1]]
//       matchDay.combinations.push(combination)
//     }
//     fixture.matchDays.push(matchDay)
//     rotation = [rotation[0], ...rotation.slice(2), rotation[1]]
//   }

//   if (rematchs) {
//     const totalMatchDays = fixture.matchDays.length
//     for (let i = 0; i < totalMatchDays; i++) {
//       fixture.matchDays.push({
//         matchDay: fixture.matchDays.length + 1,
//         combinations: fixture.matchDays[i].combinations.map(([home, away]) => [away, home]),
//       })
//     }
//   }
//   return fixture
// }
// console.log(
//   JSON.stringify(
//     generateFixture({
//       seasonId: 20,
//       competitionId: 5,
//       clubs: ['id1', 'id2', 'id3', 'id4', 'id5', 'id6', 'id7', 'id8', 'id9', 'id10'],
//       rematchs: true,
//     })
//   )
// )
