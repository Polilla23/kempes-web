import type { EmptyBracketStructure, AvailableTeam, BracketSlot } from '@/types/bracket-editor'
import { cn } from '@/lib/utils'
import { Ban, Users, X, Trophy } from 'lucide-react'

interface BracketEditorViewProps {
  structure: EmptyBracketStructure
  placements: Map<string, string>
  teams: AvailableTeam[]
  selectedTeamId: string | null
  onSlotClick: (slotId: string) => void
  onRemove: (slotId: string) => void
}

// Constantes de diseño
const MATCH_HEIGHT = 60 // Altura de cada partido
const MATCH_WIDTH = 160 // Ancho de cada partido
const VERTICAL_GAP = 16 // Gap vertical entre partidos de primera ronda
const HORIZONTAL_GAP = 40 // Gap horizontal entre rondas

// Nombres de rondas en español
const roundNames: Record<string, string> = {
  ROUND_OF_64: '64vos',
  ROUND_OF_32: '32vos',
  ROUND_OF_16: 'Octavos',
  QUARTERFINAL: 'Cuartos',
  SEMIFINAL: 'Semifinal',
  FINAL: 'Final',
}

export function BracketEditorView({
  structure,
  placements,
  teams,
  selectedTeamId,
  onSlotClick,
  onRemove,
}: BracketEditorViewProps) {
  const { slots, byePositions, rounds } = structure
  const matchesInFirstRound = structure.bracketSize / 2

  // Helper para obtener el equipo de un slot
  const getTeamForSlot = (slotId: string): AvailableTeam | undefined => {
    const teamId = placements.get(slotId)
    if (!teamId) return undefined
    return teams.find((t) => t.id === teamId)
  }

  // Agrupar slots por posición de partido (solo primera ronda)
  const firstRoundMatches: Array<{
    position: number
    homeSlot: BracketSlot
    awaySlot: BracketSlot
    isBye: boolean
  }> = []

  for (let pos = 1; pos <= matchesInFirstRound; pos++) {
    const homeSlot = slots.find((s) => s.position === pos && s.side === 'home')
    const awaySlot = slots.find((s) => s.position === pos && s.side === 'away')

    if (homeSlot && awaySlot) {
      firstRoundMatches.push({
        position: pos,
        homeSlot,
        awaySlot,
        isBye: byePositions.includes(pos),
      })
    }
  }

  // Calcular posición Y del centro de un partido de primera ronda
  const getFirstRoundMatchY = (matchIndex: number): number => {
    return matchIndex * (MATCH_HEIGHT + VERTICAL_GAP)
  }

  // Calcular posición Y recursivamente para rondas futuras
  // Cada partido se centra entre sus 2 partidos fuente
  const getMatchY = (roundIdx: number, matchIndex: number): number => {
    if (roundIdx === 0) {
      // Primera ronda futura - centrar entre 2 partidos de primera ronda
      const sourceMatch1Y = getFirstRoundMatchY(matchIndex * 2) + MATCH_HEIGHT / 2
      const sourceMatch2Y = getFirstRoundMatchY(matchIndex * 2 + 1) + MATCH_HEIGHT / 2
      return (sourceMatch1Y + sourceMatch2Y) / 2 - MATCH_HEIGHT / 2
    } else {
      // Rondas posteriores - centrar entre 2 partidos de la ronda anterior
      const sourceMatch1Y = getMatchY(roundIdx - 1, matchIndex * 2) + MATCH_HEIGHT / 2
      const sourceMatch2Y = getMatchY(roundIdx - 1, matchIndex * 2 + 1) + MATCH_HEIGHT / 2
      return (sourceMatch1Y + sourceMatch2Y) / 2 - MATCH_HEIGHT / 2
    }
  }

  // Altura total del bracket
  const totalHeight = matchesInFirstRound * MATCH_HEIGHT + (matchesInFirstRound - 1) * VERTICAL_GAP

  // Rondas futuras (después de la primera)
  const futureRounds = rounds.slice(1)

  // Ancho total del bracket
  const totalWidth = (rounds.length) * (MATCH_WIDTH + HORIZONTAL_GAP)

  return (
    <div className="space-y-3">
      {/* Header con info */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {structure.totalTeams} equipos - Bracket de {structure.bracketSize} ({structure.byeCount} BYEs)
        </p>
        {selectedTeamId && (
          <p className="text-xs text-primary mt-1 font-medium">
            Equipo seleccionado - Haz click en un slot vacío para asignarlo
          </p>
        )}
      </div>

      {/* Bracket visual */}
      <div className="overflow-x-auto pb-4">
        <div className="relative" style={{ width: totalWidth, height: totalHeight + 30, minWidth: 'fit-content' }}>
          {/* Primera ronda (editable) */}
          <div className="absolute left-0 top-0">
            {/* Header de ronda */}
            <div
              className="text-center mb-2 px-2 py-1 bg-primary/10 rounded text-xs font-medium"
              style={{ width: MATCH_WIDTH }}
            >
              {roundNames[rounds[0].round] || rounds[0].round}
            </div>
            {/* Partidos */}
            <div className="relative" style={{ height: totalHeight }}>
              {firstRoundMatches.map((match, idx) => (
                <div
                  key={match.position}
                  className="absolute"
                  style={{
                    top: getFirstRoundMatchY(idx),
                    width: MATCH_WIDTH,
                    height: MATCH_HEIGHT,
                  }}
                >
                  <EditableMatchCard
                    homeSlot={match.homeSlot}
                    awaySlot={match.awaySlot}
                    homeTeam={getTeamForSlot(match.homeSlot.id)}
                    awayTeam={getTeamForSlot(match.awaySlot.id)}
                    isBye={match.isBye}
                    selectedTeamId={selectedTeamId}
                    onSlotClick={onSlotClick}
                    onRemove={onRemove}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Rondas futuras (read-only) */}
          {futureRounds.map((round, roundIdx) => {
            const leftPos = (roundIdx + 1) * (MATCH_WIDTH + HORIZONTAL_GAP)
            const isFinal = round.round === 'FINAL'

            return (
              <div
                key={round.round}
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
                  {roundNames[round.round] || round.round}
                </div>
                {/* Partidos */}
                <div className="relative" style={{ height: totalHeight }}>
                  {Array.from({ length: round.matchCount }).map((_, matchIdx) => {
                    const topPos = getMatchY(roundIdx, matchIdx)
                    const sourceMatch1 = matchIdx * 2 + 1
                    const sourceMatch2 = matchIdx * 2 + 2

                    return (
                      <div
                        key={matchIdx}
                        className="absolute"
                        style={{
                          top: topPos,
                          width: MATCH_WIDTH,
                          height: MATCH_HEIGHT,
                        }}
                      >
                        <FutureMatchCard
                          homeLabel={`Ganador P${sourceMatch1}`}
                          awayLabel={`Ganador P${sourceMatch2}`}
                          isFinal={isFinal}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Líneas conectoras */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            style={{ width: totalWidth, height: totalHeight + 30 }}
          >
            {/* Conectores de primera ronda a segunda */}
            {futureRounds.length > 0 &&
              Array.from({ length: futureRounds[0].matchCount }).map((_, matchIdx) => {
                const source1Y = getFirstRoundMatchY(matchIdx * 2) + MATCH_HEIGHT / 2 + 30
                const source2Y = getFirstRoundMatchY(matchIdx * 2 + 1) + MATCH_HEIGHT / 2 + 30
                const targetY = getMatchY(0, matchIdx) + MATCH_HEIGHT / 2 + 30
                const x1 = MATCH_WIDTH
                const x2 = MATCH_WIDTH + HORIZONTAL_GAP

                return (
                  <g key={`conn-0-${matchIdx}`}>
                    {/* Línea desde partido superior */}
                    <path
                      d={`M ${x1} ${source1Y} H ${x1 + HORIZONTAL_GAP / 2} V ${targetY} H ${x2}`}
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                    {/* Línea desde partido inferior */}
                    <path
                      d={`M ${x1} ${source2Y} H ${x1 + HORIZONTAL_GAP / 2} V ${targetY}`}
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                  </g>
                )
              })}

            {/* Conectores de rondas siguientes */}
            {futureRounds.slice(1).map((round, roundIdx) => {
              const actualRoundIdx = roundIdx + 1

              return Array.from({ length: round.matchCount }).map((_, matchIdx) => {
                const source1Y = getMatchY(roundIdx, matchIdx * 2) + MATCH_HEIGHT / 2 + 30
                const source2Y = getMatchY(roundIdx, matchIdx * 2 + 1) + MATCH_HEIGHT / 2 + 30
                const targetY = getMatchY(actualRoundIdx, matchIdx) + MATCH_HEIGHT / 2 + 30
                const x1 = (actualRoundIdx) * (MATCH_WIDTH + HORIZONTAL_GAP) + MATCH_WIDTH
                const x2 = x1 + HORIZONTAL_GAP

                return (
                  <g key={`conn-${actualRoundIdx}-${matchIdx}`}>
                    <path
                      d={`M ${x1} ${source1Y} H ${x1 + HORIZONTAL_GAP / 2} V ${targetY} H ${x2}`}
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                    <path
                      d={`M ${x1} ${source2Y} H ${x1 + HORIZONTAL_GAP / 2} V ${targetY}`}
                      fill="none"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                  </g>
                )
              })
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}

// Componente para partido editable (primera ronda)
interface EditableMatchCardProps {
  homeSlot: BracketSlot
  awaySlot: BracketSlot
  homeTeam?: AvailableTeam
  awayTeam?: AvailableTeam
  isBye: boolean
  selectedTeamId: string | null
  onSlotClick: (slotId: string) => void
  onRemove: (slotId: string) => void
}

function EditableMatchCard({
  homeSlot,
  awaySlot,
  homeTeam,
  awayTeam,
  isBye,
  selectedTeamId,
  onSlotClick,
  onRemove,
}: EditableMatchCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden h-full',
        isBye ? 'border-amber-500/50 bg-amber-500/5' : 'border-border bg-card'
      )}
    >
      {/* Home Team */}
      <ClickableSlot
        slot={homeSlot}
        team={homeTeam}
        isSelecting={!!selectedTeamId}
        onSlotClick={onSlotClick}
        onRemove={onRemove}
      />

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Away Team / BYE */}
      {isBye ? (
        <div className="h-[29px] flex items-center justify-center gap-1 bg-amber-500/10 text-amber-600">
          <Ban className="w-3 h-3" />
          <span className="text-[10px] font-medium italic">BYE</span>
        </div>
      ) : (
        <ClickableSlot
          slot={awaySlot}
          team={awayTeam}
          isSelecting={!!selectedTeamId}
          onSlotClick={onSlotClick}
          onRemove={onRemove}
        />
      )}
    </div>
  )
}

// Componente para slot clickable
interface ClickableSlotProps {
  slot: BracketSlot
  team?: AvailableTeam
  isSelecting: boolean
  onSlotClick: (slotId: string) => void
  onRemove: (slotId: string) => void
}

function ClickableSlot({ slot, team, isSelecting, onSlotClick, onRemove }: ClickableSlotProps) {
  // Si tiene equipo asignado
  if (team) {
    return (
      <div className="h-[29px] flex items-center gap-1 px-2 bg-primary/10 group">
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="h-4 w-4 object-contain rounded" />
        ) : (
          <Users className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-[11px] font-medium flex-1 truncate">{team.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(slot.id)
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 rounded transition-opacity"
          title="Quitar equipo"
        >
          <X className="h-3 w-3 text-destructive" />
        </button>
      </div>
    )
  }

  // Slot vacío - clickable si hay equipo seleccionado
  return (
    <button
      type="button"
      onClick={() => isSelecting && onSlotClick(slot.id)}
      disabled={!isSelecting}
      className={cn(
        'h-[29px] w-full flex items-center justify-center px-2 transition-colors',
        isSelecting
          ? 'bg-primary/5 hover:bg-primary/20 cursor-pointer border-2 border-dashed border-primary/50'
          : 'bg-muted/30'
      )}
    >
      <span className="text-[10px] text-muted-foreground">
        {isSelecting ? 'Click para asignar' : 'Vacío'}
      </span>
    </button>
  )
}

// Componente para partido futuro (read-only)
interface FutureMatchCardProps {
  homeLabel: string
  awayLabel: string
  isFinal: boolean
}

function FutureMatchCard({ homeLabel, awayLabel, isFinal }: FutureMatchCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden h-full relative',
        isFinal ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-muted/20'
      )}
    >
      {/* Final indicator */}
      {isFinal && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary/20 rounded-full p-1">
          <Trophy className="w-3 h-3 text-primary" />
        </div>
      )}

      {/* Home placeholder */}
      <div className="h-[29px] flex items-center px-2">
        <span className="text-[10px] text-muted-foreground truncate">{homeLabel}</span>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Away placeholder */}
      <div className="h-[29px] flex items-center px-2">
        <span className="text-[10px] text-muted-foreground truncate">{awayLabel}</span>
      </div>
    </div>
  )
}
