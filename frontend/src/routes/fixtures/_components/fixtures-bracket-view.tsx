import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trophy, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BracketMatchCard } from './bracket-match-card'
import { BracketConnector } from './bracket-connector'
import type { BracketRound, CompetitionOption } from '../_types/fixtures.types'

interface FixturesBracketViewProps {
  cupCompetitions: CompetitionOption[]
  activeCup: string
  setActiveCup: (cup: string) => void
  bracketData: BracketRound[]
  seasonNumber?: number
  currentCup?: CompetitionOption
  isLoading?: boolean
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
  const matchHeight = 80
  const matchGap = 12

  if (cupCompetitions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay copas disponibles para mostrar brackets.</p>
      </div>
    )
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
                  <Skeleton className="h-20 w-48" />
                  <Skeleton className="h-20 w-48" />
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
          <div className="flex items-start min-w-max gap-0">
            {bracketData.map((round, roundIndex) => {
              const isLastRound = roundIndex === bracketData.length - 1
              const spacing = Math.pow(2, roundIndex)
              const gapBetweenMatches = spacing * (matchHeight + matchGap) - matchHeight
              const topPadding =
                roundIndex === 0
                  ? 0
                  : ((Math.pow(2, roundIndex) - 1) * (matchHeight + matchGap)) / 2

              return (
                <div key={round.name} className="flex items-start">
                  {/* Round Column */}
                  <div className="flex flex-col" style={{ width: 200 }}>
                    {/* Round Header */}
                    <div className="text-center mb-4 h-8 flex items-center justify-center">
                      <Badge
                        variant={isLastRound ? 'default' : 'outline'}
                        className={cn(
                          isLastRound && 'bg-primary text-primary-foreground',
                          'px-3 py-1'
                        )}
                      >
                        {round.name}
                      </Badge>
                    </div>

                    {/* Matches */}
                    <div
                      className="flex flex-col"
                      style={{
                        gap: gapBetweenMatches,
                        paddingTop: topPadding,
                      }}
                    >
                      {round.matches.map((match) => (
                        <BracketMatchCard
                          key={match.id}
                          match={match}
                          isFinal={isLastRound}
                          height={matchHeight}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Connector Lines */}
                  {!isLastRound && (
                    <div
                      className="flex flex-col"
                      style={{ paddingTop: topPadding + 8 + 4, width: 32 }}
                    >
                      {round.matches.map((_, matchIndex) => {
                        if (matchIndex % 2 === 1) return null
                        return (
                          <BracketConnector
                            key={matchIndex}
                            matchHeight={matchHeight}
                            gapBetweenMatches={gapBetweenMatches}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
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
          <div className="w-3 h-3 rounded-full bg-border" />
          <span>Por definir (TBD)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Empate (pendiente desempate)</span>
        </div>
      </div>
    </div>
  )
}
