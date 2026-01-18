import { Prisma, CompetitionStage, MatchStatus, KnockoutRound } from '@prisma/client'

/**
 * Generate round-robin fixtures (league style)
 *
 * Algorithm: Round-robin rotation with randomization
 * - Shuffles teams randomly first
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
  
  // Shuffle clubs randomly for varied calendars
  const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5)
  
  let matchdayOrder = 1
  let rotation = [...shuffledClubs]

  // Structure to hold first round matchdays (for proper second round grouping)
  const firstRoundMatchdays: Array<Array<{ home: string; away: string }>> = []

  // First round (or only round if no rematch)
  for (let i = 0; i < shuffledClubs.length - 1; i++) {
    const matchdayMatches: Array<{ home: string; away: string }> = []
    
    // Create matches for this matchday
    for (let j = 0; j < rotation.length / 2; j++) {
      const homeIdx = j
      const awayIdx = rotation.length - 1 - j
      
      matchdayMatches.push({
        home: rotation[homeIdx],
        away: rotation[awayIdx],
      })
      
      matches.push({
        competition: { connect: { id: competitionId } },
        homeClub: { connect: { id: rotation[homeIdx] } },
        awayClub: { connect: { id: rotation[awayIdx] } },
        matchdayOrder,
        stage: CompetitionStage.ROUND_ROBIN,
        status: MatchStatus.PENDIENTE,
      })
    }

    firstRoundMatchdays.push(matchdayMatches)
    matchdayOrder++

    // Rotate teams (keep first fixed, rotate rest clockwise)
    const fixed = rotation[0]
    const rest = rotation.slice(1)
    rotation = [fixed, rest[rest.length - 1], ...rest.slice(0, rest.length - 1)]
  }

  // Second round (reverse fixtures) - maintain matchday grouping
  if (rematch) {
    for (const matchdayMatches of firstRoundMatchdays) {
      for (const match of matchdayMatches) {
        matches.push({
          competition: { connect: { id: competitionId } },
          homeClub: { connect: { id: match.away } }, // Swap home/away
          awayClub: { connect: { id: match.home } },
          matchdayOrder,
          stage: CompetitionStage.ROUND_ROBIN,
          status: MatchStatus.PENDIENTE,
        })
      }
      matchdayOrder++ // Increment per matchday, not per match
    }
  }

  return matches
}

/**
 * Generate round-robin fixtures within a group (cup style)
 * Each team plays every other team once
 * Uses proper round-robin algorithm with correct matchday grouping
 *
 * @params clubIds - Array of club IDs in the group
 * @params competitionId - Competition ID
 * @params groupName - Group identifier (e.g. "GROUP_A")
 * @params startingMatchday - Starting matchday number (for multiple groups)
 */
export function generateGroupStageFixture(
  clubIds: string[],
  competitionId: string,
  groupName: string,
  startingMatchday: number = 1
): Prisma.MatchCreateInput[] {
  const matches: Prisma.MatchCreateInput[] = []
  
  // Shuffle clubs for random calendar
  const shuffledClubs = [...clubIds].sort(() => Math.random() - 0.5)
  
  // Handle odd number of teams by adding a "ghost" team (bye)
  const teams = shuffledClubs.length % 2 === 0 
    ? [...shuffledClubs] 
    : [...shuffledClubs, 'BYE']
  
  const numTeams = teams.length
  const numMatchdays = numTeams - 1
  let matchdayOrder = startingMatchday
  
  let rotation = [...teams]
  
  // Generate each matchday
  for (let round = 0; round < numMatchdays; round++) {
    // Pair teams: first with last, second with second-to-last, etc.
    for (let i = 0; i < numTeams / 2; i++) {
      const homeIdx = i
      const awayIdx = numTeams - 1 - i
      
      const homeTeam = rotation[homeIdx]
      const awayTeam = rotation[awayIdx]
      
      // Skip matches involving the "BYE" ghost team
      if (homeTeam === 'BYE' || awayTeam === 'BYE') continue
      
      matches.push({
        competition: { connect: { id: competitionId } },
        homeClub: { connect: { id: homeTeam } },
        awayClub: { connect: { id: awayTeam } },
        matchdayOrder,
        stage: CompetitionStage.ROUND_ROBIN,
        status: MatchStatus.PENDIENTE,
        homePlaceholder: groupName,
        awayPlaceholder: groupName,
      })
    }
    
    matchdayOrder++
    
    // Rotate: keep first team fixed, rotate the rest clockwise
    const fixed = rotation[0]
    const rest = rotation.slice(1)
    rotation = [fixed, rest[rest.length - 1], ...rest.slice(0, rest.length - 1)]
  }

  return matches
}

// ============================================
// KNOCKOUT BRACKET GENERATION
// ============================================

/**
 * Determina la ronda de knockout según la cantidad de equipos
 * Retorna la potencia de 2 más cercana hacia arriba
 */
export function getKnockoutRound(teamCount: number): KnockoutRound {
  if (teamCount <= 2) return KnockoutRound.FINAL
  if (teamCount <= 4) return KnockoutRound.SEMIFINAL
  if (teamCount <= 8) return KnockoutRound.QUARTERFINAL
  if (teamCount <= 16) return KnockoutRound.ROUND_OF_16
  if (teamCount <= 32) return KnockoutRound.ROUND_OF_32
  return KnockoutRound.ROUND_OF_64
}

/**
 * Calcula la cantidad de equipos que necesitan "bye" (pasan directo a la siguiente ronda)
 * @param totalTeams - Total de equipos clasificados
 * @returns { byeCount, firstRoundTeams, bracketSize }
 */
export function calculateBracketStructure(totalTeams: number): {
  byeCount: number
  firstRoundTeams: number
  bracketSize: number
  firstRound: KnockoutRound
} {
  // Encontrar la potencia de 2 más cercana hacia arriba
  let bracketSize = 2
  while (bracketSize < totalTeams) {
    bracketSize *= 2
  }

  // Equipos que pasan directo (byes) = slots del bracket - equipos reales
  const byeCount = bracketSize - totalTeams
  
  // Equipos que juegan en primera ronda = equipos totales - byes
  const firstRoundTeams = totalTeams - byeCount
  
  const firstRound = getKnockoutRound(bracketSize)

  return { byeCount, firstRoundTeams, bracketSize, firstRound }
}

/**
 * Genera los matches de un bracket de eliminación directa con placeholders
 * @param competitionId - ID de la competición (Copa Oro/Plata)
 * @param totalTeams - Total de equipos que clasifican
 * @param cupName - Nombre para los placeholders (ej: "ORO", "PLATA")
 * @param numGroups - Cantidad de grupos de fase de grupos
 * @returns Array de matches con placeholders
 */
export function generateKnockoutBracket(
  competitionId: string,
  totalTeams: number,
  cupName: string,
  numGroups: number
): Prisma.MatchCreateInput[] {
  const matches: Prisma.MatchCreateInput[] = []
  const { byeCount, bracketSize, firstRound } = calculateBracketStructure(totalTeams)
  
  // Definir las rondas en orden
  const roundOrder: KnockoutRound[] = [
    KnockoutRound.ROUND_OF_64,
    KnockoutRound.ROUND_OF_32,
    KnockoutRound.ROUND_OF_16,
    KnockoutRound.QUARTERFINAL,
    KnockoutRound.SEMIFINAL,
    KnockoutRound.FINAL,
  ]
  
  // Encontrar el índice de la primera ronda
  const startIndex = roundOrder.indexOf(firstRound)
  
  // matchdayOrder representa la ronda (1 = primera ronda, 2 = segunda, etc.)
  let matchdayOrder = 1
  let matchesInRound = bracketSize / 2 // Cantidad de partidos en la primera ronda
  
  // Generar cada ronda desde la primera hasta la final
  for (let roundIdx = startIndex; roundIdx < roundOrder.length; roundIdx++) {
    const currentRound = roundOrder[roundIdx]
    
    for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
      // Crear placeholder strings para identificar los participantes
      // En primera ronda: "1G_A" = 1ro del Grupo A, o "W_8vos_3" = Ganador del partido 3 de 8vos
      let homePlaceholder: string
      let awayPlaceholder: string
      
      if (roundIdx === startIndex) {
        // Primera ronda del bracket - equipos vienen de fase de grupos
        // Los byes se asignan a los primeros clasificados
        const homeSlot = matchNum * 2 - 1
        const awaySlot = matchNum * 2
        
        // Calcular qué posición de grupo representa cada slot
        // Ejemplo: con 4 grupos y 3 clasificados por grupo (12 equipos en bracket de 16)
        // Slots 1-4 son byes (1ros de grupo), slots 5-16 juegan primera ronda
        homePlaceholder = generateGroupPlaceholder(homeSlot, totalTeams, numGroups, byeCount, cupName)
        awayPlaceholder = generateGroupPlaceholder(awaySlot, totalTeams, numGroups, byeCount, cupName)
      } else {
        // Rondas siguientes - ganadores de la ronda anterior
        const prevRound = roundOrder[roundIdx - 1]
        const prevRoundName = getShortRoundName(prevRound)
        homePlaceholder = `W_${prevRoundName}_${matchNum * 2 - 1}`
        awayPlaceholder = `W_${prevRoundName}_${matchNum * 2}`
      }
      
      matches.push({
        competition: { connect: { id: competitionId } },
        matchdayOrder, // Mismo matchdayOrder para todos los partidos de la misma ronda
        stage: CompetitionStage.KNOCKOUT,
        knockoutRound: currentRound,
        status: MatchStatus.PENDIENTE,
        homePlaceholder,
        awayPlaceholder,
        // No conectamos clubes todavía, se asignarán cuando termine fase de grupos
        homeClub: undefined,
        awayClub: undefined,
      })
    }
    
    // Incrementar matchdayOrder por ronda, no por partido
    matchdayOrder++
    
    // La siguiente ronda tiene la mitad de partidos
    matchesInRound = matchesInRound / 2
  }
  
  // Agregar partido por 3er puesto si es necesario (opcional)
  // matches.push({...})
  
  return matches
}

/**
 * Genera un placeholder para un slot basado en la posición de grupo
 */
function generateGroupPlaceholder(
  slot: number,
  totalTeams: number,
  numGroups: number,
  byeCount: number,
  cupName: string
): string {
  // Los primeros "byeCount" slots son byes (equipos que pasan directo)
  if (slot <= byeCount) {
    // Este slot está vacío (bye), el equipo ya pasó
    return `BYE_${cupName}_${slot}`
  }
  
  // Calcular qué equipo clasificado ocupa este slot
  const classifiedPosition = slot - byeCount
  const teamsPerGroup = totalTeams / numGroups
  
  // Ejemplo: posición 5 con 4 grupos y 3 por grupo
  // Grupo = ((5-1) % 4) + 1 = 1 => Grupo A
  // Posición en grupo = Math.floor((5-1) / 4) + 1 = 2 => 2do del grupo
  const groupIndex = ((classifiedPosition - 1) % numGroups)
  const positionInGroup = Math.floor((classifiedPosition - 1) / numGroups) + 1
  
  const groupLetter = String.fromCharCode(65 + groupIndex) // A, B, C, D...
  
  return `${positionInGroup}G_${groupLetter}_${cupName}`
}

/**
 * Obtiene nombre corto de ronda para placeholders
 */
function getShortRoundName(round: KnockoutRound): string {
  switch (round) {
    case KnockoutRound.ROUND_OF_64: return '64'
    case KnockoutRound.ROUND_OF_32: return '32'
    case KnockoutRound.ROUND_OF_16: return '16'
    case KnockoutRound.QUARTERFINAL: return 'QF'
    case KnockoutRound.SEMIFINAL: return 'SF'
    case KnockoutRound.FINAL: return 'F'
    default: return round.toString()
  }
}

/**
 * Genera fixture completo de Copa Kempes
 * Incluye: Fase de grupos + Bracket Copa Oro + Bracket Copa Plata
 */
export interface CupFixtureConfig {
  groupStageCompetitionId: string      // ID de la competición de fase de grupos
  goldCupCompetitionId: string         // ID de la competición Copa Oro
  silverCupCompetitionId: string       // ID de la competición Copa Plata
  groups: { groupName: string; clubIds: string[] }[]
  qualifyToGold: number                // Cuántos clasifican a oro por grupo
  qualifyToSilver: number              // Cuántos clasifican a plata por grupo
}

export function generateFullCupFixture(config: CupFixtureConfig): {
  groupStageMatches: Prisma.MatchCreateInput[]
  goldCupMatches: Prisma.MatchCreateInput[]
  silverCupMatches: Prisma.MatchCreateInput[]
} {
  const groupStageMatches: Prisma.MatchCreateInput[] = []
  const numGroups = config.groups.length
  
  // 1. Generar partidos de fase de grupos
  for (const group of config.groups) {
    const groupMatches = generateGroupStageFixture(
      group.clubIds,
      config.groupStageCompetitionId,
      group.groupName
    )
    groupStageMatches.push(...groupMatches)
  }
  
  // 2. Generar bracket de Copa Oro
  const totalGoldTeams = numGroups * config.qualifyToGold
  const goldCupMatches = generateKnockoutBracket(
    config.goldCupCompetitionId,
    totalGoldTeams,
    'ORO',
    numGroups
  )
  
  // 3. Generar bracket de Copa Plata (si hay clasificados)
  let silverCupMatches: Prisma.MatchCreateInput[] = []
  if (config.qualifyToSilver > 0) {
    const totalSilverTeams = numGroups * config.qualifyToSilver
    silverCupMatches = generateKnockoutBracket(
      config.silverCupCompetitionId,
      totalSilverTeams,
      'PLATA',
      numGroups
    )
  }
  
  return {
    groupStageMatches,
    goldCupMatches,
    silverCupMatches,
  }
}
