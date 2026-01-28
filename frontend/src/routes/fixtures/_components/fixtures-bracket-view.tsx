import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trophy, Crown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BracketRound, BracketMatch, CompetitionOption } from '../_types/fixtures.types'

interface FixturesBracketViewProps {
  cupCompetitions: CompetitionOption[]
  activeCup: string
  setActiveCup: (cup: string) => void
  bracketData: BracketRound[]
  seasonNumber?: number
  currentCup?: CompetitionOption
  isLoading?: boolean
}

// Constantes de diseño (igual que bracket-editor)
const MATCH_HEIGHT = 60
const MATCH_WIDTH = 180
const VERTICAL_GAP = 16
const HORIZONTAL_GAP = 50

// Tipo para el camino de un equipo
interface TeamPath {
  matchIds: Set<string>
  connectorKeys: Set<string>
}

export function FixturesBracketView({
  cupCompetitions,
  activeCup,
  setActiveCup,
  bracketData,
  seasonNumber,
  currentCup,
  isLoading,
}: FixturesBracketViewProps) {
  const [highlightedClubId, setHighlightedClubId] = useState<string | null>(null)

  // Calcular el camino del equipo resaltado
  const teamPath = useMemo((): TeamPath | null => {
    if (!highlightedClubId || bracketData.length === 0) return null

    const matchIds = new Set<string>()
    const connectorKeys = new Set<string>()

    for (let roundIndex = 0; roundIndex < bracketData.length; roundIndex++) {
      const round = bracketData[roundIndex]

      for (let matchIndex = 0; matchIndex < round.matches.length; matchIndex++) {
        const match = round.matches[matchIndex]
        const isHome = match.homeClub?.id === highlightedClubId
        const isAway = match.awayClub?.id === highlightedClubId

        if (isHome || isAway) {
          matchIds.add(match.id)

          const wonMatch =
            (isHome && match.winner === 'home') || (isAway && match.winner === 'away')

          if (wonMatch && roundIndex < bracketData.length - 1) {
            const matchPairIndex = Math.floor(matchIndex / 2)
            connectorKeys.add(`${roundIndex}-${matchPairIndex}`)
          }
        }
      }
    }

    return matchIds.size > 0 ? { matchIds, connectorKeys } : null
  }, [highlightedClubId, bracketData])

  const handleTeamHover = useCallback((clubId: string | null) => {
    setHighlightedClubId(clubId)
  }, [])

  if (cupCompetitions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay copas disponibles para mostrar brackets.</p>
      </div>
    )
  }

  // Calcular dimensiones
  const matchesInFirstRound = bracketData[0]?.matches.length || 0
  const totalHeight = matchesInFirstRound * MATCH_HEIGHT + (matchesInFirstRound - 1) * VERTICAL_GAP
  const totalWidth = bracketData.length * (MATCH_WIDTH + HORIZONTAL_GAP)

  // Funciones de posicionamiento (igual que bracket-editor)
  const getFirstRoundMatchY = (matchIndex: number): number => {
    return matchIndex * (MATCH_HEIGHT + VERTICAL_GAP)
  }

  const getMatchY = (roundIdx: number, matchIndex: number): number => {
    if (roundIdx === 0) {
      return getFirstRoundMatchY(matchIndex)
    }
    const sourceMatch1Y = getMatchY(roundIdx - 1, matchIndex * 2) + MATCH_HEIGHT / 2
    const sourceMatch2Y = getMatchY(roundIdx - 1, matchIndex * 2 + 1) + MATCH_HEIGHT / 2
    return (sourceMatch1Y + sourceMatch2Y) / 2 - MATCH_HEIGHT / 2
  }

  return (
    <div className="space-y-6">
      {/* Cup Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{currentCup?.name || 'Copa'}</h2>
            <p className="text-sm text-muted-foreground">
              Temporada {seasonNumber ? `T${seasonNumber}` : ''}
            </p>
          </div>
        </div>

        <Select value={activeCup} onValueChange={setActiveCup}>
          <SelectTrigger className="w-48 bg-secondary/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cupCompetitions.map((cup) => {
              const isGold = cup.name.toLowerCase().includes('oro')
              const isSilver = cup.name.toLowerCase().includes('plata')

              return (
                <SelectItem key={cup.id} value={cup.id}>
                  <div className="flex items-center gap-2">
                    {isGold ? (
                      <Crown className="w-4 h-4 text-amber-500" />
                    ) : isSilver ? (
                      <Trophy className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Trophy className="w-4 h-4 text-primary" />
                    )}
                    {cup.name}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Bracket Visualization */}
      {isLoading ? (
        <Card className="bg-card border-border p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <div className="flex gap-8 justify-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-16 w-44" />
                  <Skeleton className="h-16 w-44" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : bracketData.length === 0 ? (
        <Card className="bg-card border-border p-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay partidos de eliminación directa aún.</p>
            <p className="text-sm mt-2">Los brackets aparecerán cuando la fase eliminatoria comience.</p>
          </div>
        </Card>
      ) : (
        <Card className="bg-card border-border p-6 overflow-x-auto">
          <div className="overflow-x-auto pb-4">
            <div
              className="relative"
              style={{ width: totalWidth, height: totalHeight + 30, minWidth: 'fit-content' }}
            >
              {/* Rondas */}
              {bracketData.map((round, roundIndex) => {
                const leftPos = roundIndex * (MATCH_WIDTH + HORIZONTAL_GAP)
                const isFinal = roundIndex === bracketData.length - 1

                return (
                  <div
                    key={round.roundKey}
                    className="absolute"
                    style={{ left: leftPos, top: 0 }}
                  >
                    {/* Header de ronda */}
                    <div
                      className={cn(
                        'text-center mb-2 px-2 py-1 rounded text-xs font-medium',
                        isFinal ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
                      )}
                      style={{ width: MATCH_WIDTH }}
                    >
                      {round.name}
                    </div>

                    {/* Partidos */}
                    <div className="relative" style={{ height: totalHeight }}>
                      {round.matches.map((match, matchIdx) => {
                        const topPos = getMatchY(roundIndex, matchIdx)
                        const isHighlighted = teamPath?.matchIds.has(match.id) ?? false

                        return (
                          <div
                            key={match.id}
                            className="absolute"
                            style={{
                              top: topPos,
                              width: MATCH_WIDTH,
                              height: MATCH_HEIGHT,
                            }}
                          >
                            <FixturesMatchCard
                              match={match}
                              isFinal={isFinal}
                              isHighlighted={isHighlighted}
                              highlightedClubId={highlightedClubId}
                              onTeamHover={handleTeamHover}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Líneas conectoras SVG */}
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                style={{ width: totalWidth, height: totalHeight + 30 }}
              >
                {bracketData.slice(0, -1).map((round, roundIndex) => {
                  const nextRound = bracketData[roundIndex + 1]
                  if (!nextRound) return null

                  return nextRound.matches.map((_, nextMatchIdx) => {
                    const matchPairIndex = nextMatchIdx
                    const connectorKey = `${roundIndex}-${matchPairIndex}`
                    const isConnectorHighlighted = teamPath?.connectorKeys.has(connectorKey) ?? false

                    const source1Idx = nextMatchIdx * 2
                    const source2Idx = nextMatchIdx * 2 + 1

                    if (source1Idx >= round.matches.length || source2Idx >= round.matches.length) {
                      return null
                    }

                    const source1Y = getMatchY(roundIndex, source1Idx) + MATCH_HEIGHT / 2 + 30
                    const source2Y = getMatchY(roundIndex, source2Idx) + MATCH_HEIGHT / 2 + 30
                    const targetY = getMatchY(roundIndex + 1, nextMatchIdx) + MATCH_HEIGHT / 2 + 30

                    const x1 = roundIndex * (MATCH_WIDTH + HORIZONTAL_GAP) + MATCH_WIDTH
                    const x2 = x1 + HORIZONTAL_GAP

                    const strokeColor = isConnectorHighlighted ? 'hsl(var(--primary))' : '#374151'
                    const strokeWidth = isConnectorHighlighted ? 3 : 2

                    return (
                      <g key={connectorKey}>
                        {/* Línea desde partido superior */}
                        <path
                          d={`M ${x1} ${source1Y} H ${x1 + HORIZONTAL_GAP / 2} V ${targetY} H ${x2}`}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          className="transition-colors"
                        />
                        {/* Línea desde partido inferior */}
                        <path
                          d={`M ${x1} ${source2Y} H ${x1 + HORIZONTAL_GAP / 2} V ${targetY}`}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          className="transition-colors"
                        />
                      </g>
                    )
                  })
                })}
              </svg>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Ganador / Clasificado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
          <span>Por definir (TBD)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Camino del equipo (hover)</span>
        </div>
      </div>
    </div>
  )
}

// Componente para partido de fixtures (read-only con hover)
interface FixturesMatchCardProps {
  match: BracketMatch
  isFinal: boolean
  isHighlighted: boolean
  highlightedClubId: string | null
  onTeamHover: (clubId: string | null) => void
}

function FixturesMatchCard({
  match,
  isFinal,
  isHighlighted,
  highlightedClubId,
  onTeamHover,
}: FixturesMatchCardProps) {
  const isPlayed = match.status === 'FINALIZADO'
  const isHomeHighlighted = highlightedClubId && match.homeClub?.id === highlightedClubId
  const isAwayHighlighted = highlightedClubId && match.awayClub?.id === highlightedClubId

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden h-full transition-all',
        // Normal state
        !highlightedClubId && 'border-border bg-card',
        // Final styling
        isFinal && !highlightedClubId && 'border-primary/50 bg-primary/5',
        // Highlighted (en el camino del equipo)
        isHighlighted && 'border-primary ring-2 ring-primary/50 shadow-lg shadow-primary/20 bg-primary/5',
        // Dimmed (no está en el camino)
        highlightedClubId && !isHighlighted && 'opacity-40'
      )}
    >
      {/* Final indicator */}
      {isFinal && (
        <div
          className={cn(
            'absolute -top-2 left-1/2 -translate-x-1/2 rounded-full p-1 z-10',
            isHighlighted ? 'bg-primary/40' : 'bg-primary/20'
          )}
        >
          <Trophy className="w-3 h-3 text-primary" />
        </div>
      )}

      {/* Home Team */}
      <TeamRow
        club={match.homeClub}
        placeholder={match.homePlaceholder}
        goals={match.homeClubGoals}
        isWinner={match.winner === 'home'}
        isPlayed={isPlayed}
        isTeamHighlighted={!!isHomeHighlighted}
        onHover={onTeamHover}
      />

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Away Team */}
      <TeamRow
        club={match.awayClub}
        placeholder={match.awayPlaceholder}
        goals={match.awayClubGoals}
        isWinner={match.winner === 'away'}
        isPlayed={isPlayed}
        isTeamHighlighted={!!isAwayHighlighted}
        onHover={onTeamHover}
      />
    </div>
  )
}

// Componente para una fila de equipo
interface TeamRowProps {
  club?: { id: string; name: string; logo?: string | null } | null
  placeholder?: string | null
  goals?: number | null
  isWinner: boolean
  isPlayed: boolean
  isTeamHighlighted: boolean
  onHover: (clubId: string | null) => void
}

function TeamRow({
  club,
  placeholder,
  goals,
  isWinner,
  isPlayed,
  isTeamHighlighted,
  onHover,
}: TeamRowProps) {
  const isTBD = !club

  return (
    <div
      className={cn(
        'h-[29px] flex items-center gap-1.5 px-2 transition-colors cursor-pointer',
        // Winner styling
        isWinner && !isTeamHighlighted && 'bg-emerald-500/10',
        // Highlighted team
        isTeamHighlighted && 'bg-primary/20',
        // Hover when not highlighted
        !isTeamHighlighted && 'hover:bg-secondary/30'
      )}
      onMouseEnter={() => club && onHover(club.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Team info */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {/* Winner/Highlight indicator */}
        {isTeamHighlighted ? (
          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
        ) : isWinner ? (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        ) : null}

        {/* Logo */}
        {club?.logo ? (
          <img src={club.logo} alt={club.name} className="h-4 w-4 object-contain rounded flex-shrink-0" />
        ) : !isTBD ? (
          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : null}

        {/* Name */}
        <span
          className={cn(
            'text-[11px] font-medium truncate',
            isTBD && 'text-muted-foreground/50 italic',
            isTeamHighlighted && 'text-primary font-semibold',
            isWinner && !isTeamHighlighted && 'text-emerald-500',
            !isTBD && !isWinner && !isTeamHighlighted && 'text-foreground'
          )}
        >
          {club?.name || placeholder || 'TBD'}
        </span>
      </div>

      {/* Score */}
      <div className="flex-shrink-0">
        {isPlayed ? (
          <span
            className={cn(
              'text-sm font-bold tabular-nums',
              isTeamHighlighted && 'text-primary',
              isWinner && !isTeamHighlighted && 'text-emerald-500',
              !isWinner && !isTeamHighlighted && 'text-foreground'
            )}
          >
            {goals ?? 0}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/30">-</span>
        )}
      </div>
    </div>
  )
}
