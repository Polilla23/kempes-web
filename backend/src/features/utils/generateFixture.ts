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
 * Información de un partido en el bracket, usado para linking posterior
 */
export interface BracketMatchInfo {
  match: Prisma.MatchCreateInput
  round: KnockoutRound
  position: number           // Posición en la ronda (1-indexed)
  isBye: boolean
  byeTeamId?: string         // ID del equipo que tiene BYE (si aplica)
}

/**
 * Resultado de generateDirectKnockoutBracket
 */
export interface DirectKnockoutResult {
  matchesByRound: Map<KnockoutRound, BracketMatchInfo[]>
  roundOrder: KnockoutRound[]  // Rondas en orden de ejecución
  startRoundIndex: number      // Índice de la primera ronda
}

/**
 * Slot en el bracket para asignación de equipos
 */
export interface BracketSlot {
  id: string                 // Ej: "QF_1_home", "QF_2_away"
  round: KnockoutRound
  position: number           // Posición del partido en la ronda (1-indexed)
  side: 'home' | 'away'
  isBye: boolean             // True si este slot debe quedar vacío (BYE)
}

/**
 * Estructura vacía del bracket (para frontend)
 */
export interface EmptyBracketStructure {
  bracketSize: number
  totalTeams: number
  byeCount: number
  firstRound: KnockoutRound
  rounds: { round: KnockoutRound; matchCount: number }[]
  slots: BracketSlot[]       // Solo slots de primera ronda donde se asignan equipos
  byePositions: number[]     // Posiciones de partidos con BYE (1-indexed)
}

/**
 * Placement de un equipo en un slot del bracket
 */
export interface BracketTeamPlacement {
  slotId: string
  teamId: string
}

/**
 * Distribuye los BYEs de forma balanceada entre llave superior e inferior
 *
 * Para un bracket, la "llave superior" son los primeros matchCount/2 partidos
 * y la "llave inferior" son los últimos matchCount/2 partidos.
 *
 * Los BYEs se distribuyen equitativamente:
 * - Si hay 2 BYEs: 1 arriba, 1 abajo
 * - Si hay 6 BYEs: 3 arriba, 3 abajo
 * - Si hay 5 BYEs: 3 arriba, 2 abajo (o viceversa)
 *
 * Dentro de cada mitad, los BYEs se colocan al final para que los equipos
 * con BYE avancen a semifinales en posiciones predecibles.
 *
 * @param matchCount - Cantidad de partidos en la primera ronda
 * @param byeCount - Cantidad de BYEs a distribuir
 * @returns Array de posiciones de partidos que son BYEs (1-indexed)
 */
export function distributeByesBalanced(matchCount: number, byeCount: number): number[] {
  if (byeCount === 0) return []
  if (byeCount >= matchCount) {
    // Todos son BYEs
    return Array.from({ length: matchCount }, (_, i) => i + 1)
  }

  const halfMatches = matchCount / 2
  const byesInUpperHalf = Math.ceil(byeCount / 2)
  const byesInLowerHalf = Math.floor(byeCount / 2)

  const byePositions: number[] = []

  // BYEs en llave superior: posiciones al final de la primera mitad
  // Ej: si hay 4 partidos arriba y 1 BYE, el BYE va en posición 2 (partido 2)
  // Para que el ganador de QF1 se cruce con el BYE en SF1
  for (let i = 0; i < byesInUpperHalf; i++) {
    byePositions.push(halfMatches - i)
  }

  // BYEs en llave inferior: posiciones al inicio de la segunda mitad
  // Ej: si hay 4 partidos abajo y 1 BYE, el BYE va en posición 3 (partido 3)
  // Para que el BYE se cruce con el ganador de QF4 en SF2
  for (let i = 0; i < byesInLowerHalf; i++) {
    byePositions.push(halfMatches + 1 + i)
  }

  return byePositions.sort((a, b) => a - b)
}

/**
 * Genera la estructura vacía del bracket sin asignar equipos
 * Usado para mostrar el bracket editable en el frontend
 *
 * @param teamCount - Cantidad de equipos participantes
 * @returns Estructura del bracket con slots para asignar equipos
 */
export function generateEmptyBracketStructure(teamCount: number): EmptyBracketStructure {
  const { byeCount, bracketSize, firstRound } = calculateBracketStructure(teamCount)

  const roundOrder: KnockoutRound[] = [
    KnockoutRound.ROUND_OF_64,
    KnockoutRound.ROUND_OF_32,
    KnockoutRound.ROUND_OF_16,
    KnockoutRound.QUARTERFINAL,
    KnockoutRound.SEMIFINAL,
    KnockoutRound.FINAL,
  ]

  const startIndex = roundOrder.indexOf(firstRound)
  const matchesInFirstRound = bracketSize / 2

  // Distribuir BYEs balanceadamente
  const byePositions = distributeByesBalanced(matchesInFirstRound, byeCount)

  // Generar info de rondas
  const rounds: { round: KnockoutRound; matchCount: number }[] = []
  let matchCount = matchesInFirstRound
  for (let i = startIndex; i < roundOrder.length; i++) {
    rounds.push({ round: roundOrder[i], matchCount })
    matchCount = Math.ceil(matchCount / 2)
  }

  // Generar slots de primera ronda (donde se asignan equipos)
  const slots: BracketSlot[] = []
  for (let position = 1; position <= matchesInFirstRound; position++) {
    const isByePosition = byePositions.includes(position)

    // En posiciones de BYE, solo el lado "home" tiene equipo
    // El lado "away" queda marcado como BYE (vacío)
    slots.push({
      id: `${firstRound}_${position}_home`,
      round: firstRound,
      position,
      side: 'home',
      isBye: false, // El home siempre tiene equipo
    })

    slots.push({
      id: `${firstRound}_${position}_away`,
      round: firstRound,
      position,
      side: 'away',
      isBye: isByePosition, // En BYE, el away está vacío
    })
  }

  return {
    bracketSize,
    totalTeams: teamCount,
    byeCount,
    firstRound,
    rounds,
    slots,
    byePositions,
  }
}

/**
 * Genera bracket de eliminación directa con equipos asignados directamente
 * Usado para Copa Cindor (Kempesitas) y Supercopa
 *
 * IMPORTANTE: Esta función retorna la estructura del bracket pero NO crea matches.
 * El service debe:
 * 1. Crear los matches de la primera ronda
 * 2. Crear los matches de rondas siguientes con sourceMatchId apuntando a la ronda anterior
 * 3. Para BYEs: asignar el equipo directamente al match de la siguiente ronda
 *
 * Los BYEs se distribuyen balanceadamente entre llave superior e inferior.
 *
 * @param competitionId - ID de la competición
 * @param teamIds - Array de IDs de equipos participantes (en el orden deseado, o se shufflea)
 * @param teamPlacements - Opcional: posicionamiento manual de equipos por slot
 * @returns Estructura del bracket con metadata para linking
 */
export function generateDirectKnockoutBracket(
  competitionId: string,
  teamIds: string[],
  teamPlacements?: BracketTeamPlacement[]
): DirectKnockoutResult {
  const { byeCount, bracketSize, firstRound } = calculateBracketStructure(teamIds.length)
  const matchesInFirstRound = bracketSize / 2

  // Distribuir BYEs balanceadamente
  const byePositions = distributeByesBalanced(matchesInFirstRound, byeCount)

  // Definir las rondas en orden
  const roundOrder: KnockoutRound[] = [
    KnockoutRound.ROUND_OF_64,
    KnockoutRound.ROUND_OF_32,
    KnockoutRound.ROUND_OF_16,
    KnockoutRound.QUARTERFINAL,
    KnockoutRound.SEMIFINAL,
    KnockoutRound.FINAL,
  ]

  const startIndex = roundOrder.indexOf(firstRound)
  let roundNumber = 1  // Para calcular matchdayOrder que codifica ronda + posición
  let matchesInRound = matchesInFirstRound

  // Construir mapa de posicionamiento de equipos
  // Si hay placements manuales, usarlos; sino, asignar automáticamente
  const slotToTeam = new Map<string, string>()

  if (teamPlacements && teamPlacements.length > 0) {
    // Usar posicionamiento manual del frontend
    for (const placement of teamPlacements) {
      slotToTeam.set(placement.slotId, placement.teamId)
    }
  } else {
    // Asignación automática: shufflear y asignar a slots no-BYE
    const shuffledTeams = [...teamIds].sort(() => Math.random() - 0.5)
    let teamIndex = 0

    for (let position = 1; position <= matchesInFirstRound; position++) {
      const isByePosition = byePositions.includes(position)

      // Home siempre tiene equipo
      const homeSlotId = `${firstRound}_${position}_home`
      slotToTeam.set(homeSlotId, shuffledTeams[teamIndex++])

      // Away solo tiene equipo si no es BYE
      if (!isByePosition) {
        const awaySlotId = `${firstRound}_${position}_away`
        slotToTeam.set(awaySlotId, shuffledTeams[teamIndex++])
      }
    }
  }

  // Track matches by round for linking
  const matchesByRound: Map<KnockoutRound, BracketMatchInfo[]> = new Map()

  // Generar cada ronda
  for (let roundIdx = startIndex; roundIdx < roundOrder.length; roundIdx++) {
    const currentRound = roundOrder[roundIdx]
    const roundMatches: BracketMatchInfo[] = []

    for (let matchNum = 0; matchNum < matchesInRound; matchNum++) {
      const position = matchNum + 1  // 1-indexed

      // matchdayOrder codifica ronda + posición: (roundNumber * 100) + position
      // Ej: QF1=101, QF2=102, SF1=201, Final=301
      const matchdayOrder = roundNumber * 100 + position

      if (roundIdx === startIndex) {
        // Primera ronda - asignar equipos desde slots
        const isByePosition = byePositions.includes(position)
        const homeSlotId = `${firstRound}_${position}_home`
        const awaySlotId = `${firstRound}_${position}_away`

        const homeTeamId = slotToTeam.get(homeSlotId)
        const awayTeamId = isByePosition ? null : slotToTeam.get(awaySlotId)

        if (isByePosition && homeTeamId) {
          // Partido con BYE - el equipo home pasa directo
          roundMatches.push({
            match: {
              competition: { connect: { id: competitionId } },
              matchdayOrder,
              stage: CompetitionStage.KNOCKOUT,
              knockoutRound: currentRound,
              status: MatchStatus.FINALIZADO, // Ya está "jugado" (bye)
              homeClub: { connect: { id: homeTeamId } },
              awayClub: undefined,
              homePlaceholder: null,
              awayPlaceholder: 'BYE',
              homeClubGoals: 3, // Victoria por defecto
              awayClubGoals: 0,
            },
            round: currentRound,
            position,
            isBye: true,
            byeTeamId: homeTeamId,
          })
        } else if (homeTeamId && awayTeamId) {
          // Partido normal (sin bye)
          roundMatches.push({
            match: {
              competition: { connect: { id: competitionId } },
              matchdayOrder,
              stage: CompetitionStage.KNOCKOUT,
              knockoutRound: currentRound,
              status: MatchStatus.PENDIENTE,
              homeClub: { connect: { id: homeTeamId } },
              awayClub: { connect: { id: awayTeamId } },
            },
            round: currentRound,
            position,
            isBye: false,
          })
        }
      } else {
        // Rondas siguientes - placeholders (se actualizarán con sourceMatchId en el service)
        const prevRound = roundOrder[roundIdx - 1]
        const prevRoundName = getShortRoundName(prevRound)
        const homePlaceholder = `W_${prevRoundName}_${position * 2 - 1}`
        const awayPlaceholder = `W_${prevRoundName}_${position * 2}`

        roundMatches.push({
          match: {
            competition: { connect: { id: competitionId } },
            matchdayOrder,
            stage: CompetitionStage.KNOCKOUT,
            knockoutRound: currentRound,
            status: MatchStatus.PENDIENTE,
            homePlaceholder,
            awayPlaceholder,
            homeClub: undefined,
            awayClub: undefined,
          },
          round: currentRound,
          position,
          isBye: false,
        })
      }
    }

    matchesByRound.set(currentRound, roundMatches)
    roundNumber++
    matchesInRound = Math.ceil(matchesInRound / 2)
  }

  return {
    matchesByRound,
    roundOrder,
    startRoundIndex: startIndex,
  }
}

// ============================================
// POST-SEASON FIXTURE GENERATION
// ============================================

/**
 * Información de un equipo en los standings para post-temporada
 */
export interface PostSeasonTeam {
  clubId: string
  position: number  // Posición en la tabla regular (1-indexed)
}

/**
 * Genera fixtures de Liguilla (mini liga entre los mejores equipos)
 * Round-robin a partido único entre N equipos con knockoutRound = LIGUILLA
 *
 * @param teams - Equipos participantes con su posición en tabla regular
 * @param competitionId - ID de la competición (misma liga)
 * @param lastMatchday - Última jornada de la fase regular (para numerar desde ahí)
 * @returns Array de matches para crear
 */
export function generateLiguillaFixture(
  teams: PostSeasonTeam[],
  competitionId: string,
  lastMatchday: number
): Prisma.MatchCreateInput[] {
  const matches: Prisma.MatchCreateInput[] = []
  const clubIds = teams.map(t => t.clubId)

  // Usar el mismo algoritmo de round-robin pero con knockoutRound = LIGUILLA
  // No shuffleamos: mantenemos el orden de la tabla para que las localías sean coherentes
  const numTeams = clubIds.length
  let matchdayOrder = lastMatchday + 1
  let rotation = [...clubIds]

  for (let round = 0; round < numTeams - 1; round++) {
    for (let i = 0; i < Math.floor(numTeams / 2); i++) {
      const homeIdx = i
      const awayIdx = numTeams - 1 - i

      matches.push({
        competition: { connect: { id: competitionId } },
        homeClub: { connect: { id: rotation[homeIdx] } },
        awayClub: { connect: { id: rotation[awayIdx] } },
        matchdayOrder,
        stage: CompetitionStage.KNOCKOUT,
        knockoutRound: KnockoutRound.LIGUILLA,
        status: MatchStatus.PENDIENTE,
      })
    }

    matchdayOrder++

    // Rotar (primero fijo, resto rota)
    const fixed = rotation[0]
    const rest = rotation.slice(1)
    rotation = [fixed, rest[rest.length - 1], ...rest.slice(0, rest.length - 1)]
  }

  return matches
}

/**
 * Genera fixtures de Triangular (3° vs 2° en semi, ganador vs 1° en final)
 * Partido único por fase, con linking de sourceMatchId
 *
 * @param team1st - Equipo 1° clasificado
 * @param team2nd - Equipo 2° clasificado
 * @param team3rd - Equipo 3° clasificado
 * @param competitionId - ID de la competición
 * @param lastMatchday - Última jornada de la fase regular
 * @returns Array de matches para crear (se crean secuencialmente para linking)
 */
export function generateTriangularFixture(
  team1st: PostSeasonTeam,
  team2nd: PostSeasonTeam,
  team3rd: PostSeasonTeam,
  competitionId: string,
  lastMatchday: number
): { semiMatch: Prisma.MatchCreateInput; finalMatch: Prisma.MatchCreateInput } {
  // Semifinal: 3° vs 2°
  const semiMatch: Prisma.MatchCreateInput = {
    competition: { connect: { id: competitionId } },
    homeClub: { connect: { id: team3rd.clubId } },
    awayClub: { connect: { id: team2nd.clubId } },
    matchdayOrder: lastMatchday + 1,
    stage: CompetitionStage.KNOCKOUT,
    knockoutRound: KnockoutRound.TRIANGULAR_SEMI,
    status: MatchStatus.PENDIENTE,
  }

  // Final: Ganador semi vs 1° (se linkea con sourceMatchId)
  // El ganador de la semi va como visitante (1° tiene localía)
  const finalMatch: Prisma.MatchCreateInput = {
    competition: { connect: { id: competitionId } },
    homeClub: { connect: { id: team1st.clubId } },
    // awayClub se asigna via sourceMatch después de crear la semi
    matchdayOrder: lastMatchday + 2,
    stage: CompetitionStage.KNOCKOUT,
    knockoutRound: KnockoutRound.TRIANGULAR_FINAL,
    status: MatchStatus.PENDIENTE,
    homePlaceholder: null,
    awayPlaceholder: 'Ganador Semi',
    // sourceMatch se conecta en el service después de crear la semi
  }

  return { semiMatch, finalMatch }
}

/**
 * Genera fixture de Playout (partido único entre 2 equipos)
 * El perdedor puede ir a promoción inter-división
 *
 * @param teamA - Primer equipo (mejor clasificado = local)
 * @param teamB - Segundo equipo (peor clasificado = visitante)
 * @param competitionId - ID de la competición
 * @param lastMatchday - Última jornada de la fase regular
 * @returns Match para crear
 */
export function generatePlayoutFixture(
  teamA: PostSeasonTeam,
  teamB: PostSeasonTeam,
  competitionId: string,
  lastMatchday: number
): Prisma.MatchCreateInput {
  return {
    competition: { connect: { id: competitionId } },
    homeClub: { connect: { id: teamA.clubId } },
    awayClub: { connect: { id: teamB.clubId } },
    matchdayOrder: lastMatchday + 1,
    stage: CompetitionStage.KNOCKOUT,
    knockoutRound: KnockoutRound.PLAYOUT,
    status: MatchStatus.PENDIENTE,
  }
}

/**
 * Genera fixtures de Reducido (cascada/waterfall bracket)
 * Formato: Primera ronda → luego cada ganador enfrenta al equipo en espera
 *
 * Ejemplo con startPositions=[7,8], waitingPositions=[6,5,4,3]:
 * - R1 (Quarter): 7° vs 8°
 * - R2 (Semi): 6° vs Ganador R1
 * - R3 (Final): 5° vs Ganador R2
 * - R4 (Extra): 4° vs Ganador R3
 * - R5 (Extra): 3° vs Ganador R4
 *
 * @param startTeamA - Equipo en startPositions[0]
 * @param startTeamB - Equipo en startPositions[1]
 * @param waitingTeams - Equipos en espera, en orden (primero el que espera en R2, etc.)
 * @param competitionId - ID de la competición
 * @param lastMatchday - Última jornada de la fase regular
 * @returns Array de matches para crear (se crean secuencialmente para linking)
 */
export function generateReducidoFixture(
  startTeamA: PostSeasonTeam,
  startTeamB: PostSeasonTeam,
  waitingTeams: PostSeasonTeam[],
  competitionId: string,
  lastMatchday: number
): Prisma.MatchCreateInput[] {
  const matches: Prisma.MatchCreateInput[] = []

  // Determinar el knockoutRound según la cantidad total de rondas
  const totalRounds = 1 + waitingTeams.length
  const getReducidoRound = (roundIndex: number, total: number): KnockoutRound => {
    if (total <= 3) {
      // 3 rondas o menos: quarter, semi, final
      if (roundIndex === total - 1) return KnockoutRound.REDUCIDO_FINAL
      if (roundIndex === total - 2) return KnockoutRound.REDUCIDO_SEMI
      return KnockoutRound.REDUCIDO_QUARTER
    }
    // Más de 3 rondas: las últimas 3 son quarter/semi/final, las anteriores son quarter
    if (roundIndex === total - 1) return KnockoutRound.REDUCIDO_FINAL
    if (roundIndex === total - 2) return KnockoutRound.REDUCIDO_SEMI
    return KnockoutRound.REDUCIDO_QUARTER
  }

  // Primera ronda: partido directo entre startTeamA y startTeamB
  const firstRoundMatch: Prisma.MatchCreateInput = {
    competition: { connect: { id: competitionId } },
    homeClub: { connect: { id: startTeamA.clubId } },
    awayClub: { connect: { id: startTeamB.clubId } },
    matchdayOrder: lastMatchday + 1,
    stage: CompetitionStage.KNOCKOUT,
    knockoutRound: getReducidoRound(0, totalRounds),
    status: MatchStatus.PENDIENTE,
  }
  matches.push(firstRoundMatch)

  // Rondas siguientes: equipo en espera vs ganador de ronda anterior
  for (let i = 0; i < waitingTeams.length; i++) {
    const waitingTeam = waitingTeams[i]
    const roundIndex = i + 1
    const knockoutRound = getReducidoRound(roundIndex, totalRounds)

    const match: Prisma.MatchCreateInput = {
      competition: { connect: { id: competitionId } },
      homeClub: { connect: { id: waitingTeam.clubId } },
      // awayClub se asigna via sourceMatch después de crear el match anterior
      matchdayOrder: lastMatchday + 1 + roundIndex,
      stage: CompetitionStage.KNOCKOUT,
      knockoutRound,
      status: MatchStatus.PENDIENTE,
      homePlaceholder: null,
      awayPlaceholder: `Ganador R${roundIndex}`,
      // sourceMatch se conecta en el service
    }
    matches.push(match)
  }

  return matches
}

/**
 * Genera fixtures de Promoción inter-división (partido único)
 * Empareja equipos de liga superior vs liga inferior por seeding
 *
 * @param upperTeams - Equipos de liga superior (peor → mejor)
 * @param lowerTeams - Equipos de liga inferior (mejor → peor)
 * @param competitionId - ID de la competición de promociones
 * @returns Array de matches para crear
 */
export function generatePromotionFixtures(
  upperTeams: PostSeasonTeam[],
  lowerTeams: PostSeasonTeam[],
  competitionId: string
): Prisma.MatchCreateInput[] {
  const matches: Prisma.MatchCreateInput[] = []
  const matchCount = Math.min(upperTeams.length, lowerTeams.length)

  for (let i = 0; i < matchCount; i++) {
    // Mejor de inferior vs Peor de superior
    const lowerTeam = lowerTeams[i]           // Mejor → peor
    const upperTeam = upperTeams[matchCount - 1 - i]  // Peor → mejor

    matches.push({
      competition: { connect: { id: competitionId } },
      // Equipo de la liga inferior es local (busca el ascenso)
      homeClub: { connect: { id: lowerTeam.clubId } },
      awayClub: { connect: { id: upperTeam.clubId } },
      matchdayOrder: i + 1,
      stage: CompetitionStage.KNOCKOUT,
      knockoutRound: KnockoutRound.PROMOTION,
      status: MatchStatus.PENDIENTE,
    })
  }

  return matches
}
