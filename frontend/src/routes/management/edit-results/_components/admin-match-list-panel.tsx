import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Trophy, Shield, Check, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { MatchDetailedDTO } from '@/services/fixture.service'
import { SeasonService } from '@/services/season.service'
import { FixtureService } from '@/services/fixture.service'

type Category = 'mayores' | 'menores' | 'supercopa'
type StatusFilter = 'all' | 'FINALIZADO' | 'PENDIENTE' | 'CANCELADO'

const CATEGORY_MAP: Record<Category, string[]> = {
  mayores: ['SENIOR'],
  menores: ['KEMPESITA'],
  supercopa: ['MIXED'],
}

interface Season {
  id: string
  number: number
  isActive: boolean
}

interface CompetitionOption {
  id: string
  name: string
  category: string
  format: string
  hierarchy: number
}

const getCompetitionColors = (typeName: string) => {
  const name = typeName.toUpperCase()
  if (name.includes('GOLD')) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
  if (name.includes('SILVER')) return 'bg-gray-400/20 text-gray-500 border-gray-400/40'
  if (name.includes('KEMPES') || name.includes('CINDOR') || name.includes('SUPER'))
    return 'bg-primary/10 text-primary border-primary/30'
  return 'bg-muted text-muted-foreground border-transparent'
}

const getStatusBadge = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'FINALIZADO':
      return <Badge variant="default" className="text-[10px] bg-green-600">{t('status.FINALIZADO')}</Badge>
    case 'PENDIENTE':
      return <Badge variant="secondary" className="text-[10px] bg-yellow-500/20 text-yellow-600 border-yellow-500/30">{t('status.PENDIENTE')}</Badge>
    case 'CANCELADO':
      return <Badge variant="destructive" className="text-[10px]">{t('status.CANCELADO')}</Badge>
    default:
      return null
  }
}

const getKnockoutRoundLabel = (round: string | null, matchdayOrder: number) => {
  if (!round) return `Fecha ${matchdayOrder}`
  const labels: Record<string, string> = {
    FINAL: 'Final',
    SEMIFINAL: 'Semifinal',
    QUARTERFINAL: 'Cuartos de Final',
    ROUND_OF_16: 'Octavos de Final',
    ROUND_OF_32: '32avos de Final',
    ROUND_OF_64: '64avos de Final',
    LIGUILLA: 'Liguilla',
  }
  return labels[round] || round
}

interface AdminMatchListPanelProps {
  selectedMatchId: string | null
  onSelectMatch: (matchId: string) => void
  onMatchesLoaded: (matches: MatchDetailedDTO[]) => void
}

export function AdminMatchListPanel({
  selectedMatchId,
  onSelectMatch,
  onMatchesLoaded,
}: AdminMatchListPanelProps) {
  const { t } = useTranslation('editResults')

  // Data
  const [seasons, setSeasons] = useState<Season[]>([])
  const [allMatches, setAllMatches] = useState<MatchDetailedDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)

  // Filters
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('mayores')
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all')

  // Load seasons on mount
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const response = await SeasonService.getSeasons()
        const allSeasons = response.seasons || []
        setSeasons(allSeasons)
        const active = allSeasons.find((s) => s.isActive)
        if (active) setSelectedSeason(active.id)
      } catch (err) {
        console.error('Error loading seasons:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSeasons()
  }, [])

  // Load matches when season changes
  useEffect(() => {
    if (!selectedSeason) return
    const loadMatches = async () => {
      setIsLoadingMatches(true)
      try {
        const matches = await FixtureService.getSeasonMatches(selectedSeason)
        setAllMatches(matches)
        onMatchesLoaded(matches)
      } catch (err) {
        console.error('Error loading matches:', err)
        setAllMatches([])
      } finally {
        setIsLoadingMatches(false)
      }
    }
    loadMatches()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason])

  // Derive competitions from matches
  const competitionsFromMatches = useMemo(() => {
    const compMap = new Map<string, CompetitionOption>()
    allMatches.forEach((m) => {
      if (m.competition && !compMap.has(m.competitionId)) {
        compMap.set(m.competitionId, {
          id: m.competitionId,
          name: m.competition.name,
          category: m.competition.competitionType?.category?.toUpperCase() || '',
          format: m.competition.competitionType?.format?.toUpperCase() || '',
          hierarchy: m.competition.competitionType?.hierarchy ?? 999,
        })
      }
    })
    return Array.from(compMap.values()).sort((a, b) => a.hierarchy - b.hierarchy || a.name.localeCompare(b.name))
  }, [allMatches])

  // Filter competitions by category
  const filteredCompetitions = useMemo(() => {
    const allowedCategories = CATEGORY_MAP[selectedCategory]
    return competitionsFromMatches.filter((comp) => allowedCategories.includes(comp.category))
  }, [competitionsFromMatches, selectedCategory])

  // Filter matches
  const filteredMatches = useMemo(() => {
    let result = allMatches
    const allowedCategories = CATEGORY_MAP[selectedCategory]

    if (selectedCompetition !== 'all') {
      result = result.filter((m) => m.competitionId === selectedCompetition)
    } else {
      result = result.filter((m) => {
        const matchCategory = m.competition?.competitionType?.category?.toUpperCase()
        return allowedCategories.includes(matchCategory || '')
      })
    }

    if (selectedStatus !== 'all') {
      result = result.filter((m) => m.status === selectedStatus)
    }

    return result
  }, [allMatches, selectedCompetition, selectedStatus, selectedCategory])

  // Reset competition when category changes
  const handleCategoryChange = (cat: Category) => {
    setSelectedCategory(cat)
    setSelectedCompetition('all')
  }

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeason(seasonId)
    setSelectedCompetition('all')
  }

  const currentSeasonNumber = seasons.find((s) => s.id === selectedSeason)?.number

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle className="text-foreground">{t('matchList.title')}</CardTitle>
        </div>
        {currentSeasonNumber != null && (
          <p className="text-sm text-muted-foreground">
            {t('matchList.subtitle', { season: currentSeasonNumber })}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Filters */}
        <div className="space-y-2">
          {/* Season */}
          <Select value={selectedSeason} onValueChange={handleSeasonChange}>
            <SelectTrigger className="w-full bg-secondary/50 border-border h-8 text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder="Temporada" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id}>
                  <div className="flex items-center gap-2">
                    T{season.number}
                    {season.isActive && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">
                        Actual
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category tabs */}
          <div className="flex bg-secondary/50 p-0.5 rounded-lg">
            <Button
              variant={selectedCategory === 'mayores' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleCategoryChange('mayores')}
              className="flex-1 gap-1 text-xs h-7"
            >
              <Users className="w-3 h-3" />
              Mayores
            </Button>
            <Button
              variant={selectedCategory === 'menores' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleCategoryChange('menores')}
              className="flex-1 gap-1 text-xs h-7"
            >
              <Users className="w-3 h-3" />
              Menores
            </Button>
            <Button
              variant={selectedCategory === 'supercopa' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleCategoryChange('supercopa')}
              className="flex-1 gap-1 text-xs h-7"
            >
              <Trophy className="w-3 h-3" />
              Super
            </Button>
          </div>

          {/* Competition + Status row */}
          <div className="flex gap-2">
            <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
              <SelectTrigger className="flex-1 bg-secondary/50 border-border h-8 text-xs">
                <SelectValue placeholder={t('filters.allCompetitions')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allCompetitions')}</SelectItem>
                {filteredCompetitions.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as StatusFilter)}>
              <SelectTrigger className="w-[120px] bg-secondary/50 border-border h-8 text-xs">
                <SelectValue placeholder={t('filters.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                <SelectItem value="FINALIZADO">{t('filters.finalized')}</SelectItem>
                <SelectItem value="PENDIENTE">{t('filters.pending')}</SelectItem>
                <SelectItem value="CANCELADO">{t('filters.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Match count */}
        <p className="text-xs text-muted-foreground">
          {filteredMatches.length} {filteredMatches.length === 1 ? 'partido' : 'partidos'}
        </p>

        {/* Match list */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {isLoading || isLoadingMatches ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('matchList.empty')}
            </p>
          ) : (
            filteredMatches.map((match) => (
              <button
                key={match.id}
                onClick={() => onSelectMatch(match.id)}
                className={cn(
                  'w-full text-left bg-secondary/50 border rounded-xl p-3 transition-all hover:border-primary/50',
                  selectedMatchId === match.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border'
                )}
              >
                {/* Competition + Status */}
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] gap-1',
                      getCompetitionColors(match.competition.competitionType.name)
                    )}
                  >
                    {match.competition.competitionType.format === 'CUP' ? (
                      <Trophy className="w-3 h-3" />
                    ) : (
                      <Shield className="w-3 h-3" />
                    )}
                    {match.competition.name}
                  </Badge>
                  {getStatusBadge(match.status, t)}
                </div>

                {/* Matchday */}
                <p className="text-xs text-muted-foreground mb-1.5">
                  {getKnockoutRoundLabel(match.knockoutRound, match.matchdayOrder)}
                </p>

                {/* Teams + Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold border overflow-hidden bg-muted text-muted-foreground border-border">
                      {match.homeClub.logo ? (
                        <img src={match.homeClub.logo} alt={match.homeClub.name} className="w-full h-full object-cover" />
                      ) : (
                        match.homeClub.name.substring(0, 3).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-medium truncate max-w-[80px]">{match.homeClub.name}</span>
                  </div>

                  {match.status === 'FINALIZADO' ? (
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {match.homeClubGoals} - {match.awayClubGoals}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">vs</span>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium truncate max-w-[80px] text-right">{match.awayClub.name}</span>
                    <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold border overflow-hidden bg-muted text-muted-foreground border-border">
                      {match.awayClub.logo ? (
                        <img src={match.awayClub.logo} alt={match.awayClub.name} className="w-full h-full object-cover" />
                      ) : (
                        match.awayClub.name.substring(0, 3).toUpperCase()
                      )}
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedMatchId === match.id && (
                  <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-primary/20 text-primary text-xs font-medium">
                    <Check className="w-3.5 h-3.5" />
                    {t('matchList.selected')}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
