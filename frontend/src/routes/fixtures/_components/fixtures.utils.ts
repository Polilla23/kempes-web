// Utility functions for fixtures page

import type { 
  RoundKey, 
  BracketColumn, 
  BracketSlotCell, 
  BracketNode, 
  BracketEdge,
  BracketGrid,
  Match,
  KnockoutMatch
} from './fixtures.types'
import { phaseLabels } from './fixtures.types'

/**
 * Format competition label by removing season suffix
 */
export function formatCompetitionLabel(seasonNumber: number | undefined, name: string): string {
  if (!seasonNumber) return name
  return name.replace(new RegExp(`\\s*-\\s*T${seasonNumber}\\s*$`, 'i'), '')
}

/**
 * Get stage label based on matchday order
 */
export function stageLabelForMatchdayOrder(matchdayOrder: number): string {
  if (matchdayOrder >= 16) return '16vos'
  if (matchdayOrder >= 8) return '8vos'
  if (matchdayOrder >= 4) return 'Cuartos'
  if (matchdayOrder >= 2) return 'Semis'
  if (matchdayOrder >= 1) return 'Final'
  return 'Fase'
}

/**
 * Get competition format label in Spanish
 */
export function competitionFormatLabel(format: string | null | undefined): string {
  const f = (format ?? '').trim().toUpperCase()
  if (f === 'CUP') return 'Copa'
  if (f === 'LEAGUE') return 'Liga'
  return f || '-'
}

/**
 * Format group name for display
 * Handles both single letter ('A', 'B') and 'GROUP_X' formats
 */
export function formatGroupName(group: string): string {
  if (!group) return ''
  // Handle GROUP_X format
  if (group.startsWith('GROUP_')) {
    return `Grupo ${group.replace('GROUP_', '')}`
  }
  // Handle single letter format (A, B, C...)
  if (/^[A-Z]$/.test(group)) {
    return `Grupo ${group}`
  }
  return group
}

/**
 * Get the round key for a knockout round string
 */
export function roundKeyForKnockout(knockoutRound: string | null | undefined): RoundKey | null {
  if (!knockoutRound) return null
  const r = knockoutRound.trim().toUpperCase()
  
  if (r.includes('ROUND_OF_32')) return 'R32'
  if (r.includes('ROUND_OF_16')) return 'R16'
  if (r.includes('QUARTERFINAL')) return 'QF'
  if (r.includes('SEMIFINAL')) return 'SF'
  if (r.includes('FINAL') && !r.includes('SEMI')) return 'F'
  
  return null
}

/**
 * Infer round key based on matchday order and total number of matches
 * This is used when knockoutRound is not set
 */
export function inferRoundKeyFromMatchday(matchdayOrder: number, totalMatchdays: number): RoundKey | null {
  // Map matchday to round based on how many matchdays there are
  // If there are 3 matchdays: 1=QF, 2=SF, 3=F
  // If there are 2 matchdays: 1=SF, 2=F
  // If there's 1 matchday: 1=F
  const roundsFromEnd = totalMatchdays - matchdayOrder
  
  switch (roundsFromEnd) {
    case 0: return 'F'   // Final is always the last matchday
    case 1: return 'SF'  // Semifinal is 1 before final
    case 2: return 'QF'  // Quarterfinal is 2 before final
    case 3: return 'R16' // Round of 16 is 3 before final
    case 4: return 'R32' // Round of 32 is 4 before final
    default: return null
  }
}

/**
 * Get round label in Spanish
 */
export function roundLabel(key: RoundKey): string {
  switch (key) {
    case 'R32':
      return '32vos'
    case 'R16':
      return '16vos'
    case 'QF':
      return 'Cuartos'
    case 'SF':
      return 'Semis'
    case 'F':
      return 'Final'
  }
}

/**
 * Get winner ID from a match
 */
export function winnerIdForMatch(match: Match): string | null {
  if (match.status !== 'JUGADO') return null
  if (match.homeClubGoals > match.awayClubGoals) return match.homeClub?.id ?? null
  if (match.awayClubGoals > match.homeClubGoals) return match.awayClub?.id ?? null
  return null
}

/**
 * Normalize stage label to Spanish
 */
export function normalizeStageLabel(stage: string | null | undefined): string {
  if (!stage) return 'Fase'

  const s = stage.trim().toUpperCase()
  const knownPhase = phaseLabels.find((p) => p.key === s)
  if (knownPhase) return knownPhase.label

  // Common Spanish fallbacks
  if (s.includes('OCTAV')) return 'Octavos de Final'
  if (s.includes('CUART')) return 'Cuartos de Final'
  if (s.includes('SEMI')) return 'Semifinal'
  if (s.includes('FINAL')) return 'Final'

  return stage
}

/**
 * Get stage order for sorting
 */
export function getStageOrder(stageLabel: string): number {
  const normalized = stageLabel.trim().toUpperCase()
  const known = phaseLabels.find((p) => p.label.toUpperCase() === normalized)
  return known?.order ?? 0
}

/**
 * Create bracket grid for visualization
 */
export function makeBracketGrid(columns: BracketColumn[]): BracketGrid {
  const sizeByRound: Record<RoundKey, number> = { R32: 16, R16: 8, QF: 4, SF: 2, F: 1 }
  const maxSize = Math.max(...columns.map((c) => sizeByRound[c.key] ?? 1))

  const grid = columns.map((col) => {
    const desired = Math.max(sizeByRound[col.key] ?? col.matches.length, col.matches.length)
    const scale = Math.max(1, Math.floor(maxSize / desired))
    const cells: BracketSlotCell[] = []

    for (let i = 0; i < desired; i++) {
      const match = col.matches[i]
      for (let s = 0; s < Math.floor(scale / 2); s++) cells.push({ kind: 'spacer' })
      if (match) {
        cells.push({ kind: 'match', match, connector: col.key !== 'F' })
      } else {
        cells.push({ kind: 'spacer' })
      }
      for (let s = 0; s < Math.ceil(scale / 2); s++) cells.push({ kind: 'spacer' })
    }

    const targetRows = maxSize * 12
    while (cells.length < targetRows) cells.push({ kind: 'spacer' })
    return { ...col, cells }
  })

  const rows = Math.max(...grid.map((c) => c.cells.length))
  return { columns: grid, rows }
}

/**
 * Build bracket graph for connector rendering
 */
export function buildBracketGraph(columns: BracketColumn[]): { nodeById: Map<string, BracketNode>; edges: BracketEdge[] } {
  const nodeById = new Map<string, BracketNode>()
  const edges: BracketEdge[] = []

  const order: RoundKey[] = ['R32', 'R16', 'QF', 'SF', 'F']
  const colIndexByRound = new Map<RoundKey, number>()
  order.forEach((k, idx) => colIndexByRound.set(k, idx))

  for (const col of columns) {
    const colIndex = colIndexByRound.get(col.key) ?? 0
    for (let i = 0; i < col.matches.length; i++) {
      const m = col.matches[i]
      nodeById.set(m.id, { id: m.id, round: col.key, match: m, colIndex, rowIndex: i })

      const homeSrc = m.homeSourceMatchId ?? undefined
      const awaySrc = m.awaySourceMatchId ?? undefined
      if (homeSrc) edges.push({ fromId: homeSrc, toId: m.id })
      if (awaySrc) edges.push({ fromId: awaySrc, toId: m.id })
    }
  }

  return { nodeById, edges }
}

/**
 * Build adjacency maps for graph traversal
 */
export function buildAdjacency(edges: BracketEdge[]): { forward: Map<string, string[]>; backward: Map<string, string[]> } {
  const forward = new Map<string, string[]>()
  const backward = new Map<string, string[]>()
  for (const e of edges) {
    forward.set(e.fromId, [...(forward.get(e.fromId) ?? []), e.toId])
    backward.set(e.toId, [...(backward.get(e.toId) ?? []), e.fromId])
  }
  return { forward, backward }
}

/**
 * Collect reachable nodes from a starting point
 */
export function collectReachable(start: string, nextMap: Map<string, string[]>): Set<string> {
  const seen = new Set<string>()
  const stack = [start]
  while (stack.length) {
    const cur = stack.pop()!
    if (seen.has(cur)) continue
    seen.add(cur)
    const next = nextMap.get(cur) ?? []
    for (const n of next) stack.push(n)
  }
  return seen
}

/**
 * Group knockout matches by phase
 */
export function groupKnockoutByPhase(knockoutMatches: KnockoutMatch[]): Array<[string, KnockoutMatch[]]> {
  const grouped = new Map<string, KnockoutMatch[]>()
  for (const match of knockoutMatches) {
    const label = normalizeStageLabel(match.stage)
    const list = grouped.get(label) ?? []
    list.push(match)
    grouped.set(label, list)
  }
  const entries = Array.from(grouped.entries())
  entries.sort((a, b) => {
    const orderDiff = getStageOrder(a[0]) - getStageOrder(b[0])
    if (orderDiff !== 0) return orderDiff
    return a[0].localeCompare(b[0])
  })
  for (const [, list] of entries) {
    list.sort((x, y) => (x.matchdayOrder ?? 0) - (y.matchdayOrder ?? 0))
  }
  return entries
}
