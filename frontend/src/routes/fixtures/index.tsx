import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  List,
  GitBranch,
  Users,
  Trophy,
  Layers,
  ChevronRight,
  Clock,
  CheckCircle2,
  Upload,
  ChevronDown,
  ChevronUp,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { checkAuth } from '@/services/auth-guard'
import { SeasonService } from '@/services/season.service'
import CompetitionService, { type Competition } from '@/services/competition.service'
import api from '@/services/api'

export const Route = createFileRoute('/fixtures/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: FixturesPage,
})

// Types
type ViewMode = 'list' | 'bracket'
type Category = 'mayores' | 'menores'
type CompetitionTypeFilter = 'liga' | 'copa'

interface Season {
  id: string
  number: number
  isActive: boolean
}

interface Match {
  id: string
  competitionId: string
  competitionName: string
  matchdayOrder: number
  knockoutRound?: string | null
  homeClub: { id: string; name: string; logo: string | null } | null
  awayClub: { id: string; name: string; logo: string | null } | null
  homeClubGoals: number
  awayClubGoals: number
  status: 'PENDIENTE' | 'JUGADO' | 'CANCELADO'
  stage?: string
  homePlaceholder?: string
  awayPlaceholder?: string
  homeSourceMatchId?: string | null
  awaySourceMatchId?: string | null
  competition?: {
    id: string
    name: string
    competitionType?: {
      format: string
      name: string
      category?: string
      hierarchy?: number
    }
  }
  events?: MatchEvent[]
}

interface MatchEvent {
  type: 'goal' | 'yellow' | 'red' | 'substitution' | 'own-goal'
  minute: number
  player: string
  team: 'home' | 'away'
  assist?: string
}

interface BracketMatch extends Match {
  winner?: 'home' | 'away'
}

interface BracketRound {
  name: string
  matches: BracketMatch[]
}

function FixturesPage() {
  const { t } = useTranslation('fixtures')

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<Category>('mayores')
  const [selectedType, setSelectedType] = useState<CompetitionTypeFilter>('liga')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'played' | 'pending'>('all')
  const [expandedMatches, setExpandedMatches] = useState<string[]>([])

  // Data state
  const [seasons, setSeasons] = useState<Season[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingKnockout, setIsLoadingKnockout] = useState(false)

  // Bracket state for cup selection
  const [activeCup, setActiveCup] = useState<string>('')

  // Load seasons on mount
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const response = await SeasonService.getSeasons()
        setSeasons(response.seasons || [])
        const activeSeason = response.seasons?.find((s: Season) => s.isActive)
        if (activeSeason) {
          setSelectedSeason(activeSeason.id)
        }
      } catch (err) {
        console.error('Error loading seasons:', err)
      }
    }
    loadSeasons()
  }, [])

  // Load competitions when season changes
  useEffect(() => {
    if (!selectedSeason) return

    const loadCompetitions = async () => {
      try {
        const response = await CompetitionService.getCompetitions()
        const filtered = response.data
          ?.filter((c: Competition) => c.seasonId === selectedSeason)
          .sort((a, b) => {
            const aType = a.competitionType || a.type
            const bType = b.competitionType || b.type
            const aHierarchy = aType?.hierarchy ?? 999
            const bHierarchy = bType?.hierarchy ?? 999
            if (aHierarchy !== bHierarchy) return aHierarchy - bHierarchy
            return a.name.localeCompare(b.name)
          }) || []
        setCompetitions(filtered)
      } catch (err) {
        console.error('Error loading competitions:', err)
      }
    }
    loadCompetitions()
  }, [selectedSeason])

  // Load matches when filters change
  useEffect(() => {
    const loadMatches = async () => {
      setIsLoading(true)
      try {
        let allMatches: Match[] = []

        if (selectedCompetition !== 'all') {
          // Load matches for specific competition
          const response = await api.get<{ data: Match[] }>(`/api/v1/fixtures/competitions/${selectedCompetition}`)
          allMatches = response.data?.data || []
        } else {
          // Load matches for all filtered competitions
          const filteredComps = competitions.filter(comp => {
            const compType = comp.competitionType || comp.type
            if (compType?.category?.toLowerCase() !== selectedCategory) return false
            const format = compType?.format?.toLowerCase()
            if (selectedType === 'liga' && format !== 'league') return false
            if (selectedType === 'copa' && format !== 'cup') return false
            return true
          })

          // Load matches for each competition
          const matchPromises = filteredComps.map(comp =>
            api.get<{ data: Match[] }>(`/api/v1/fixtures/competitions/${comp.id}`)
              .then(res => (res.data?.data || []).map(m => ({
                ...m,
                competitionId: comp.id,
                competitionName: comp.name,
                competition: {
                  id: comp.id,
                  name: comp.name,
                  competitionType: comp.competitionType || comp.type,
                }
              })))
              .catch(() => [])
          )

          const results = await Promise.all(matchPromises)
          allMatches = results.flat()
        }

        setMatches(allMatches)
      } catch (err) {
        console.error('Error loading matches:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (competitions.length > 0) {
      loadMatches()
    }
  }, [selectedCompetition, selectedCategory, selectedType, competitions])

  // Filtered competitions based on category and type
  const filteredCompetitions = useMemo(() => {
    return competitions.filter(comp => {
      const compType = comp.competitionType || comp.type
      if (compType?.category?.toLowerCase() !== selectedCategory) return false
      const format = compType?.format?.toLowerCase()
      if (selectedType === 'liga' && format !== 'league') return false
      if (selectedType === 'copa' && format !== 'cup') return false
      return true
    })
  }, [competitions, selectedCategory, selectedType])

  // Check if current competition has bracket view available
  const currentCompetition = useMemo(() => {
    return competitions.find(c => c.id === selectedCompetition)
  }, [competitions, selectedCompetition])

  const showBracketOption = useMemo(() => {
    if (selectedCompetition === 'all') return true // Allow bracket view when "all" is selected
    const compType = currentCompetition?.competitionType || currentCompetition?.type
    return compType?.format?.toLowerCase() === 'cup'
  }, [currentCompetition, selectedCompetition])

  // Filter matches by status
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      if (selectedStatus === 'played' && match.status !== 'JUGADO') return false
      if (selectedStatus === 'pending' && match.status !== 'PENDIENTE') return false
      return true
    })
  }, [matches, selectedStatus])

  // Group matches by competition
  const groupedMatches = useMemo(() => {
    const groups: Record<string, { name: string; matches: Match[] }> = {}

    filteredMatches.forEach(match => {
      const key = match.competitionId || match.competition?.id || 'unknown'
      const name = match.competitionName || match.competition?.name || 'Competición'

      if (!groups[key]) {
        groups[key] = { name, matches: [] }
      }
      groups[key].matches.push(match)
    })

    return groups
  }, [filteredMatches])

  // Cup competitions for bracket selector (exclude Copa Kempes - it's groups only)
  const cupCompetitions = useMemo(() => {
    return competitions.filter(comp => {
      const compType = comp.competitionType || comp.type
      if (compType?.format?.toLowerCase() !== 'cup') return false
      // Exclude Copa Kempes as it only has group stage, no knockout brackets
      const name = comp.name.toLowerCase()
      if (name.includes('kempes')) return false
      return true
    })
  }, [competitions])

  // Set initial active cup
  useEffect(() => {
    if (cupCompetitions.length > 0 && !activeCup) {
      setActiveCup(cupCompetitions[0].id)
    }
  }, [cupCompetitions, activeCup])

  // Load knockout matches from dedicated endpoint when activeCup changes
  useEffect(() => {
    if (!activeCup || viewMode !== 'bracket') {
      setKnockoutMatches([])
      return
    }

    const loadKnockoutMatches = async () => {
      setIsLoadingKnockout(true)
      try {
        const response = await api.get<{ data: Match[] }>(`/api/v1/fixtures/competitions/${activeCup}/knockout`)
        setKnockoutMatches(response.data?.data || [])
      } catch (err) {
        console.error('Error loading knockout matches:', err)
        setKnockoutMatches([])
      } finally {
        setIsLoadingKnockout(false)
      }
    }

    loadKnockoutMatches()
  }, [activeCup, viewMode])

  // Bracket data for the active cup - use knockout matches from dedicated endpoint
  const bracketData = useMemo((): BracketRound[] => {
    if (!activeCup || knockoutMatches.length === 0) return []

    // Group by knockout round
    const roundOrder = ['ROUND_OF_64', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL']
    const roundLabels: Record<string, string> = {
      'ROUND_OF_64': '64vos de Final',
      'ROUND_OF_32': '32vos de Final',
      'ROUND_OF_16': 'Octavos de Final',
      'QUARTERFINAL': 'Cuartos de Final',
      'SEMIFINAL': 'Semifinales',
      'FINAL': 'Final',
    }

    const rounds: Record<string, BracketMatch[]> = {}

    knockoutMatches.forEach(match => {
      const round = match.knockoutRound || inferRoundFromMatchday(match.matchdayOrder, knockoutMatches.length)
      if (!rounds[round]) {
        rounds[round] = []
      }

      // Determine winner
      let winner: 'home' | 'away' | undefined
      if (match.status === 'JUGADO') {
        if (match.homeClubGoals > match.awayClubGoals) winner = 'home'
        else if (match.awayClubGoals > match.homeClubGoals) winner = 'away'
      }

      rounds[round].push({ ...match, winner })
    })

    return roundOrder
      .filter(r => rounds[r] && rounds[r].length > 0)
      .map(r => ({
        name: roundLabels[r] || r,
        matches: rounds[r],
      }))
  }, [activeCup, knockoutMatches])

  const toggleExpand = (matchId: string) => {
    setExpandedMatches(prev =>
      prev.includes(matchId)
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    )
  }

  const getEventIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal': return '⚽'
      case 'own-goal': return '⚽ (p.p.)'
      case 'yellow': return '🟨'
      case 'red': return '🟥'
      case 'substitution': return '🔄'
      default: return ''
    }
  }

  const seasonNumber = seasons.find(s => s.id === selectedSeason)?.number

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[5%] lg:px-[7%] xl:px-[10%] py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fixtures y Resultados</h1>
            <p className="text-muted-foreground mt-1">
              Todos los partidos de la temporada {seasonNumber ? `T${seasonNumber}` : ''}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'bracket' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('bracket')}
              disabled={!showBracketOption}
              className="gap-2"
            >
              <GitBranch className="w-4 h-4" />
              Brackets
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Tabs */}
            <div className="flex bg-secondary/50 p-1 rounded-lg">
              <Button
                variant={selectedCategory === 'mayores' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('mayores')}
                className="gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                Mayores
              </Button>
              <Button
                variant={selectedCategory === 'menores' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('menores')}
                className="gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                Menores
              </Button>
            </div>

            {/* Type Tabs */}
            <div className="flex bg-secondary/50 p-1 rounded-lg">
              <Button
                variant={selectedType === 'liga' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedType('liga')}
                className="gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                Liga
              </Button>
              <Button
                variant={selectedType === 'copa' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedType('copa')}
                className="gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                Copa
              </Button>
            </div>

            {/* Competition Filter */}
            <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
              <SelectTrigger className="w-[200px] bg-secondary/50 border-border">
                <SelectValue placeholder="Todas las competencias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {filteredCompetitions.map((comp) => {
                  const compType = comp.competitionType || comp.type
                  return (
                    <SelectItem key={comp.id} value={comp.id}>
                      <div className="flex items-center gap-2">
                        {comp.name}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {compType?.format === 'CUP' ? 'Copa' : `Div ${compType?.hierarchy || ''}`}
                        </Badge>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as 'all' | 'played' | 'pending')}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="played">Jugados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {selectedCompetition !== 'all' && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="gap-1">
                {competitions.find((c) => c.id === selectedCompetition)?.name}
                <button onClick={() => setSelectedCompetition('all')} className="ml-1 hover:text-destructive">
                  ×
                </button>
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-card border-border">
                <div className="bg-primary/10 px-4 py-3 border-b border-border">
                  <Skeleton className="h-8 w-48" />
                </div>
                <CardContent className="p-0">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="px-4 py-3 border-b border-border last:border-0">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <FixturesListView
            groupedMatches={groupedMatches}
            expandedMatches={expandedMatches}
            toggleExpand={toggleExpand}
            getEventIcon={getEventIcon}
          />
        ) : (
          <BracketView
            cupCompetitions={cupCompetitions}
            activeCup={activeCup}
            setActiveCup={setActiveCup}
            bracketData={bracketData}
            seasonNumber={seasonNumber}
            isLoading={isLoadingKnockout}
          />
        )}
      </div>
    </div>
  )
}

// List View Component
interface FixturesListViewProps {
  groupedMatches: Record<string, { name: string; matches: Match[] }>
  expandedMatches: string[]
  toggleExpand: (matchId: string) => void
  getEventIcon: (type: MatchEvent['type']) => string
}

function FixturesListView({
  groupedMatches,
  expandedMatches,
  toggleExpand,
  getEventIcon,
}: FixturesListViewProps) {
  if (Object.keys(groupedMatches).length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No se encontraron partidos con los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMatches).map(([competitionId, { name, matches }]) => (
        <Card key={competitionId} className="bg-card border-border overflow-hidden">
          {/* Competition Header */}
          <div className="bg-primary/10 px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-foreground">{name}</span>
              <Badge variant="outline" className="text-xs">
                {matches.length} partidos
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Matches Table */}
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {matches.map((match) => {
                const isExpanded = expandedMatches.includes(match.id)
                const hasEvents = match.events && match.events.length > 0

                return (
                  <div key={match.id}>
                    <div
                      className={cn(
                        'px-4 py-3 hover:bg-secondary/30 transition-colors flex items-center gap-4',
                        hasEvents && 'cursor-pointer'
                      )}
                      onClick={() => hasEvents && toggleExpand(match.id)}
                    >
                      {/* Expand Button */}
                      <div className="w-6 flex-shrink-0">
                        {hasEvents && (
                          <Button variant="ghost" size="icon" className="w-6 h-6 p-0">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Round/Matchday */}
                      <div className="w-20 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {match.knockoutRound
                            ? getRoundLabel(match.knockoutRound)
                            : `Fecha ${match.matchdayOrder}`}
                        </span>
                      </div>

                      {/* Home Team */}
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {match.homeClub?.name || 'TBD'}
                            </p>
                          </div>
                          <div className="w-7 h-7 bg-muted rounded flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border shrink-0">
                            {match.homeClub?.logo ? (
                              <img src={match.homeClub.logo} alt="" className="w-5 h-5 object-contain" />
                            ) : (
                              match.homeClub?.name?.slice(0, 3).toUpperCase() || 'TBD'
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score / Status */}
                      <div className="w-24 flex-shrink-0 flex items-center justify-center">
                        {match.status === 'JUGADO' ? (
                          <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg">
                            <span className="text-lg font-bold text-foreground">{match.homeClubGoals}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-lg font-bold text-foreground">{match.awayClubGoals}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-muted rounded flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border shrink-0">
                            {match.awayClub?.logo ? (
                              <img src={match.awayClub.logo} alt="" className="w-5 h-5 object-contain" />
                            ) : (
                              match.awayClub?.name?.slice(0, 3).toUpperCase() || 'TBD'
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {match.awayClub?.name || 'TBD'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status Icon */}
                      <div className="w-10 flex-shrink-0 flex justify-end">
                        {match.status === 'JUGADO' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-primary hover:bg-primary/10">
                            <Upload className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Events */}
                    {isExpanded && hasEvents && (
                      <div className="bg-muted/30 px-4 py-3 border-t border-border">
                        <div className="flex gap-8">
                          {/* Home Team Events */}
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              {match.homeClub?.name}
                            </p>
                            <div className="space-y-1">
                              {match.events
                                ?.filter((e) => e.team === 'home')
                                .sort((a, b) => a.minute - b.minute)
                                .map((event, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground w-8">{event.minute}'</span>
                                    <span>{getEventIcon(event.type)}</span>
                                    <span className="text-foreground">{event.player}</span>
                                    {event.assist && (
                                      <span className="text-muted-foreground text-xs">
                                        (Asist: {event.assist})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              {match.events?.filter((e) => e.team === 'home').length === 0 && (
                                <p className="text-xs text-muted-foreground">Sin eventos</p>
                              )}
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="w-px bg-border" />

                          {/* Away Team Events */}
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              {match.awayClub?.name}
                            </p>
                            <div className="space-y-1">
                              {match.events
                                ?.filter((e) => e.team === 'away')
                                .sort((a, b) => a.minute - b.minute)
                                .map((event, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground w-8">{event.minute}'</span>
                                    <span>{getEventIcon(event.type)}</span>
                                    <span className="text-foreground">{event.player}</span>
                                    {event.assist && (
                                      <span className="text-muted-foreground text-xs">
                                        (Asist: {event.assist})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              {match.events?.filter((e) => e.team === 'away').length === 0 && (
                                <p className="text-xs text-muted-foreground">Sin eventos</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Bracket View Component
interface BracketViewProps {
  cupCompetitions: Competition[]
  activeCup: string
  setActiveCup: (cup: string) => void
  bracketData: BracketRound[]
  seasonNumber?: number
  isLoading?: boolean
}

function BracketView({
  cupCompetitions,
  activeCup,
  setActiveCup,
  bracketData,
  seasonNumber,
  isLoading,
}: BracketViewProps) {
  const currentCup = cupCompetitions.find((c) => c.id === activeCup)
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
              const topPadding = roundIndex === 0 ? 0 : (Math.pow(2, roundIndex) - 1) * (matchHeight + matchGap) / 2

              return (
                <div key={round.name} className="flex items-start">
                  {/* Round Column */}
                  <div className="flex flex-col" style={{ width: 200 }}>
                    {/* Round Header */}
                    <div className="text-center mb-4 h-8 flex items-center justify-center">
                      <Badge
                        variant={isLastRound ? 'default' : 'outline'}
                        className={cn(isLastRound && 'bg-primary text-primary-foreground', 'px-3 py-1')}
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
                    <div className="flex flex-col" style={{ paddingTop: topPadding + 8 + 4, width: 32 }}>
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

// Bracket Match Card
function BracketMatchCard({
  match,
  isFinal,
  height,
}: {
  match: BracketMatch
  isFinal: boolean
  height: number
}) {
  const isPlayed = match.status === 'JUGADO'
  const isDraw = isPlayed && match.homeClubGoals === match.awayClubGoals
  const isTBD = !match.homeClub || !match.awayClub

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-all hover:shadow-md',
        isFinal
          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30'
      )}
      style={{ height }}
    >
      {/* Final Trophy Icon */}
      {isFinal && (
        <div className="bg-primary/20 px-2 py-1 flex items-center justify-center gap-1.5 border-b border-primary/20">
          <Trophy className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">FINAL</span>
        </div>
      )}

      {/* Home Team */}
      <div
        className={cn(
          'flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 transition-colors',
          match.winner === 'home' ? 'bg-emerald-500/10' : 'hover:bg-secondary/30'
        )}
        style={{ height: isFinal ? (height - 24) / 2 : height / 2 }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {match.winner === 'home' && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-medium truncate',
                isTBD
                  ? 'text-muted-foreground/50 italic'
                  : match.winner === 'home'
                  ? 'text-emerald-500'
                  : 'text-foreground'
              )}
            >
              {match.homeClub?.name || 'TBD'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-1">
          {isPlayed ? (
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                match.winner === 'home'
                  ? 'text-emerald-500'
                  : isDraw
                  ? 'text-amber-500'
                  : 'text-foreground'
              )}
            >
              {match.homeClubGoals}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/30">-</span>
          )}
        </div>
      </div>

      {/* Away Team */}
      <div
        className={cn(
          'flex items-center justify-between px-2.5 py-1.5 transition-colors',
          match.winner === 'away' ? 'bg-emerald-500/10' : 'hover:bg-secondary/30'
        )}
        style={{ height: isFinal ? (height - 24) / 2 : height / 2 }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {match.winner === 'away' && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-medium truncate',
                isTBD
                  ? 'text-muted-foreground/50 italic'
                  : match.winner === 'away'
                  ? 'text-emerald-500'
                  : 'text-foreground'
              )}
            >
              {match.awayClub?.name || 'TBD'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-1">
          {isPlayed ? (
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                match.winner === 'away'
                  ? 'text-emerald-500'
                  : isDraw
                  ? 'text-amber-500'
                  : 'text-foreground'
              )}
            >
              {match.awayClubGoals}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/30">-</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Bracket Connector
function BracketConnector({
  matchHeight,
  gapBetweenMatches,
}: {
  matchHeight: number
  gapBetweenMatches: number
}) {
  const halfMatch = matchHeight / 2
  const totalPairHeight = matchHeight * 2 + gapBetweenMatches
  const middlePoint = halfMatch + (matchHeight + gapBetweenMatches) / 2

  return (
    <div className="relative" style={{ height: totalPairHeight, marginBottom: gapBetweenMatches }}>
      {/* Top match horizontal line */}
      <div
        className="absolute bg-border"
        style={{
          left: 0,
          top: halfMatch,
          width: 16,
          height: 2,
        }}
      />
      {/* Vertical line connecting both matches */}
      <div
        className="absolute bg-border"
        style={{
          left: 15,
          top: halfMatch,
          width: 2,
          height: matchHeight + gapBetweenMatches,
        }}
      />
      {/* Bottom match horizontal line */}
      <div
        className="absolute bg-border"
        style={{
          left: 0,
          top: matchHeight + gapBetweenMatches + halfMatch,
          width: 16,
          height: 2,
        }}
      />
      {/* Middle horizontal line going to next round */}
      <div
        className="absolute bg-border"
        style={{
          left: 16,
          top: middlePoint,
          width: 16,
          height: 2,
        }}
      />
    </div>
  )
}

// Helper functions
function getRoundLabel(round: string | null | undefined): string {
  if (!round) return 'Fase'
  switch (round) {
    case 'ROUND_OF_64': return '64vos'
    case 'ROUND_OF_32': return '32vos'
    case 'ROUND_OF_16': return 'Octavos'
    case 'QUARTERFINAL': return 'Cuartos'
    case 'SEMIFINAL': return 'Semifinal'
    case 'FINAL': return 'Final'
    default: return round
  }
}

function inferRoundFromMatchday(matchday: number, totalMatches: number): string {
  // Simple inference based on matchday order
  if (totalMatches <= 1) return 'FINAL'
  if (totalMatches <= 2) return matchday === 1 ? 'SEMIFINAL' : 'FINAL'
  if (totalMatches <= 4) {
    if (matchday <= 2) return 'QUARTERFINAL'
    if (matchday <= 4) return 'SEMIFINAL'
    return 'FINAL'
  }
  if (totalMatches <= 8) {
    if (matchday <= 4) return 'ROUND_OF_16'
    if (matchday <= 6) return 'QUARTERFINAL'
    if (matchday <= 7) return 'SEMIFINAL'
    return 'FINAL'
  }
  return 'ROUND_OF_32'
}
