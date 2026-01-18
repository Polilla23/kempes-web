// Fixtures page - refactored
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Trophy, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { SeasonService } from '@/services/season.service'
import CompetitionService, { type Competition } from '@/services/competition.service'
import api from '@/services/api'

// Types
import type { 
  Match, 
  Season, 
  ViewMode, 
  CompetitionPresentation, 
  KnockoutMatch, 
  KnockoutResponse,
  RoundKey
} from './_components/fixtures.types'

// Utils
import {
  formatCompetitionLabel,
  stageLabelForMatchdayOrder,
  competitionFormatLabel,
  formatGroupName,
  roundKeyForKnockout,
  inferRoundKeyFromMatchday,
  roundLabel,
  makeBracketGrid,
  buildBracketGraph,
  buildAdjacency,
  collectReachable,
  groupKnockoutByPhase
} from './_components/fixtures.utils'

// Components
import { MatchRow, getStatusBadge } from './_components/match-components'
import { BracketCard, BracketUConnectors, BracketExactConnectors } from './_components/bracket-components'
import { checkAuth } from '@/services/auth-guard'
import React from 'react'

export const Route = createFileRoute('/fixtures/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: FixturesPage,
})

function FixturesPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatch[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [selectedCompetition, setSelectedCompetition] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL') // 'ALL' o nombre del grupo
  const [viewMode, setViewMode] = useState<ViewMode>('byDate')
  const [currentMatchday, setCurrentMatchday] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [hoveredBracketMatchId, setHoveredBracketMatchId] = useState<string | null>(null)
  const [bracketContainerEl, setBracketContainerEl] = useState<HTMLElement | null>(null)
  const bracketCardEls = useMemo(() => new Map<string, HTMLElement>(), [])
  
  const registerBracketCardEl = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (!el) {
        bracketCardEls.delete(id)
        return
      }
      bracketCardEls.set(id, el)
    },
    [bracketCardEls]
  )

  // Data loading
  const loadSeasons = useCallback(async () => {
    try {
      const response = await SeasonService.getSeasons()
      setSeasons(response.seasons || [])
      const activeSeason = response.seasons?.find((s: Season) => s.isActive)
      if (activeSeason) {
        setSelectedSeason(activeSeason.id)
      }
    } catch (err) {
      console.error('Error loading seasons:', err)
      setError('Error al cargar las temporadas')
    }
  }, [])

  const loadCompetitions = useCallback(async (seasonId: string) => {
    try {
      setIsLoading(true)
      const response = await CompetitionService.getCompetitions()
      const filtered =
        response.data
          ?.filter((c: Competition) => c.seasonId === seasonId)
          .sort((a, b) => {
            const aType = a.competitionType || a.type
            const bType = b.competitionType || b.type
            const aHierarchy = aType?.hierarchy ?? 999
            const bHierarchy = bType?.hierarchy ?? 999
            if (aHierarchy !== bHierarchy) return aHierarchy - bHierarchy
            const aFormat = aType?.format ?? ''
            const bFormat = bType?.format ?? ''
            if (aFormat !== bFormat) return aFormat.localeCompare(bFormat)
            return a.name.localeCompare(b.name)
          }) || []
      setCompetitions(filtered)
      if (filtered.length > 0) {
        setSelectedCompetition(filtered[0].id)
      }
    } catch (err) {
      console.error('Error loading competitions:', err)
      setError('Error al cargar las competiciones')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadKnockoutMatches = useCallback(async (competitionId: string) => {
    const response = await api.get<KnockoutResponse>(`/api/v1/fixtures/competitions/${competitionId}/knockout`)
    console.log('🥊 Raw API response (stringified):', JSON.stringify(response, null, 2))
    const data = response.data?.data || []
    console.log('🥊 Knockout data (stringified):', JSON.stringify(data, null, 2))
    return data
  }, [])

  const loadMatches = useCallback(
    async (competitionId: string) => {
      try {
        setIsLoading(true)
        setError(null)
        setMatches([])
        setKnockoutMatches([])

        const response = await api.get<{ data: Match[]; message?: string; timestamp: string }>(
          `/api/v1/fixtures/competitions/${competitionId}`
        )

        const matchesData = response.data?.data || []
        setMatches(matchesData)

        const knockout = await loadKnockoutMatches(competitionId)
        setKnockoutMatches(knockout)
        setCurrentMatchday(1)
      } catch (err) {
        console.error('Error loading matches:', err)
        setError('Error al cargar los partidos')
        setMatches([])
        setKnockoutMatches([])
      } finally {
        setIsLoading(false)
      }
    },
    [loadKnockoutMatches]
  )

  // Effects
  useEffect(() => { loadSeasons() }, [loadSeasons])
  useEffect(() => { if (selectedSeason) loadCompetitions(selectedSeason) }, [selectedSeason, loadCompetitions])
  useEffect(() => { if (selectedCompetition) loadMatches(selectedCompetition) }, [selectedCompetition, loadMatches])
  useEffect(() => { setSelectedTeam('') }, [selectedCompetition, viewMode])

  // Computed values
  const getMatchesByMatchday = (matchday: number) => matches.filter((m) => m.matchdayOrder === matchday)
  const getUniqueMatchdays = () => [...new Set(matches.map((m) => m.matchdayOrder))].sort((a, b) => a - b)
  const getTeamsFromMatches = () => {
    const teams = new Set<string>()
    matches.forEach((match) => {
      if (match.homeClub) teams.add(match.homeClub.id)
      if (match.awayClub) teams.add(match.awayClub.id)
    })
    return Array.from(teams)
  }
  const getMatchesByTeam = (teamId: string) => matches.filter((m) => m.homeClub?.id === teamId || m.awayClub?.id === teamId)

  const totalMatchdays = getUniqueMatchdays().length
  const selectedCompetitionObj = useMemo(() => competitions.find((c) => c.id === selectedCompetition), [competitions, selectedCompetition])
  
  // Helper to get competition type (backend returns competitionType, but we support both)
  const getCompetitionType = (comp: Competition | undefined) => comp?.competitionType || comp?.type
  const selectedCompetitionType = useMemo(() => getCompetitionType(selectedCompetitionObj), [selectedCompetitionObj])
  
  // Determine if this is a CUP or LEAGUE based on competition type format or name
  const competitionPresentation: CompetitionPresentation = useMemo(() => {
    const format = selectedCompetitionType?.format
    const typeName = selectedCompetitionType?.name?.toLowerCase() || ''
    const compName = selectedCompetitionObj?.name?.toLowerCase() || ''
    
    // Check format first, then fallback to name-based detection
    if (format === 'CUP') return 'CUP'
    if (format === 'LEAGUE') return 'LEAGUE'
    
    // Fallback: check if name contains "copa" or "cup"
    if (typeName.includes('copa') || typeName.includes('cup') || 
        compName.includes('copa') || compName.includes('cup')) {
      return 'CUP'
    }
    
    return 'LEAGUE'
  }, [selectedCompetitionObj, selectedCompetitionType])

  // Check if there are knockout matches (pure knockout cups like Copa de Oro)
  const hasKnockout = knockoutMatches.length > 0
  
  // For knockout-only cups, also check if regular matches have stage === 'KNOCKOUT'
  const hasKnockoutInMatches = useMemo(() => {
    return matches.some(m => m.stage === 'KNOCKOUT')
  }, [matches])

  // Check if this is a cup with groups (matches have homePlaceholder like 'A', 'B', 'C' or 'GROUP_A')
  const availableGroups = useMemo(() => {
    const groups = new Set<string>()
    matches.forEach((m) => {
      // Check for group placeholders (single letter A-Z or GROUP_X format)
      if (m.homePlaceholder) {
        const ph = m.homePlaceholder.trim()
        // Match single letter groups (A, B, C...) or GROUP_X format
        if (/^[A-Z]$/.test(ph) || ph.startsWith('GROUP_')) {
          groups.add(ph)
        }
      }
    })
    return Array.from(groups).sort()
  }, [matches])

  const hasGroups = availableGroups.length > 0
  
  // Determine what type of matches this competition has
  // - ROUND_ROBIN_ONLY: Liga pura (solo fechas)
  // - GROUPS_ONLY: Copa Kempes fase de grupos (solo grupos, sin knockout aún)
  // - KNOCKOUT_ONLY: Copas de eliminación directa (Copa de Oro, Plata, Bronce)
  // - GROUPS_AND_KNOCKOUT: Copa Kempes completa (grupos + knockout)
  const competitionMode = useMemo(() => {
    if (competitionPresentation === 'LEAGUE') return 'ROUND_ROBIN_ONLY'
    // Check both knockoutMatches and matches with KNOCKOUT stage
    const isKnockout = hasKnockout || hasKnockoutInMatches
    if (hasGroups && isKnockout) return 'GROUPS_AND_KNOCKOUT'
    if (hasGroups) return 'GROUPS_ONLY'
    if (isKnockout) return 'KNOCKOUT_ONLY'
    return 'ROUND_ROBIN_ONLY' // fallback
  }, [competitionPresentation, hasGroups, hasKnockout, hasKnockoutInMatches])
  
  // Get unique knockout phases for display
  const knockoutPhases = useMemo(() => {
    const phases = new Set<string>()
    // First try knockoutMatches
    if (knockoutMatches.length > 0) {
      knockoutMatches.forEach((m) => {
        if (m.knockoutRound) phases.add(m.knockoutRound)
      })
    } else {
      // Fallback to matches with KNOCKOUT stage
      matches.filter(m => m.stage === 'KNOCKOUT').forEach((m) => {
        phases.add(String(m.matchdayOrder)) // Use matchdayOrder as phase identifier
      })
    }
    return Array.from(phases)
  }, [knockoutMatches, matches])
  
  // Combined knockout matches: use knockoutMatches if available, otherwise convert from matches
  const effectiveKnockoutMatches = useMemo((): KnockoutMatch[] => {
    if (knockoutMatches.length > 0) return knockoutMatches
    // Convert matches with KNOCKOUT stage to KnockoutMatch format
    return matches
      .filter(m => m.stage === 'KNOCKOUT')
      .map(m => ({
        ...m,
        knockoutRound: null, // Will be determined by matchdayOrder
        homeSourceMatch: null,
        awaySourceMatch: null,
        homeSourceMatchId: null,
        awaySourceMatchId: null,
      }))
  }, [knockoutMatches, matches])
  
  // Get unique knockout rounds in order for navigation
  // Order: SEMIFINAL before FINAL
  const knockoutRoundOrder = ['ROUND_OF_64', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL']
  
  const uniqueKnockoutRounds = useMemo(() => {
    const rounds = [...new Set(effectiveKnockoutMatches.map(m => m.knockoutRound).filter(Boolean))] as string[]
    // Sort by the defined order
    return rounds.sort((a, b) => knockoutRoundOrder.indexOf(a) - knockoutRoundOrder.indexOf(b))
  }, [effectiveKnockoutMatches])
  
  // Label for knockout round
  const knockoutRoundLabel = (round: string | null): string => {
    if (!round) return 'Fase'
    switch (round) {
      case 'ROUND_OF_64': return '64vos de Final'
      case 'ROUND_OF_32': return '32vos de Final'
      case 'ROUND_OF_16': return 'Octavos de Final'
      case 'QUARTERFINAL': return 'Cuartos de Final'
      case 'SEMIFINAL': return 'Semifinal'
      case 'FINAL': return 'Final'
      default: return round
    }
  }
  
  const [currentKnockoutPhase, setCurrentKnockoutPhase] = useState(0)
  
  // Reset knockout phase when competition changes
  useEffect(() => {
    setCurrentKnockoutPhase(0)
  }, [selectedCompetition])

  // Reset group filter and viewMode when competition changes
  // Use a ref to track if we need to update viewMode based on loaded data
  const lastCompetitionRef = React.useRef<string | null>(null)
  const viewModeSetRef = React.useRef(false)
  
  useEffect(() => {
    if (selectedCompetition !== lastCompetitionRef.current) {
      lastCompetitionRef.current = selectedCompetition
      viewModeSetRef.current = false // Reset flag when competition changes
      setSelectedGroup('ALL')
    }
  }, [selectedCompetition])
  
  // Set viewMode based on competitionMode, but only once per competition load
  useEffect(() => {
    if (!viewModeSetRef.current && (matches.length > 0 || knockoutMatches.length > 0)) {
      viewModeSetRef.current = true
      if (competitionMode === 'KNOCKOUT_ONLY') {
        setViewMode('byPhase')
      } else {
        setViewMode('byDate')
      }
    }
  }, [competitionMode, matches.length, knockoutMatches.length])

  // Reset matchday when group filter changes
  useEffect(() => {
    setCurrentMatchday(1)
  }, [selectedGroup])

  // Filter matches by selected group
  const filteredMatches = useMemo(() => {
    if (!hasGroups || selectedGroup === 'ALL') return matches
    return matches.filter((m) => m.homePlaceholder === selectedGroup)
  }, [matches, selectedGroup, hasGroups])

  // Use filtered matches for display
  const getFilteredMatchesByMatchday = (matchday: number) => filteredMatches.filter((m) => m.matchdayOrder === matchday)
  const getFilteredUniqueMatchdays = () => [...new Set(filteredMatches.map((m) => m.matchdayOrder))].sort((a, b) => a - b)
  const filteredTotalMatchdays = getFilteredUniqueMatchdays().length

  const bracketColumns = useMemo(() => {
    const map = new Map<RoundKey, KnockoutMatch[]>()
    const totalRounds = uniqueKnockoutRounds.length
    
    for (const match of effectiveKnockoutMatches) {
      // Try to get round from knockoutRound, otherwise infer from matchdayOrder
      let key = roundKeyForKnockout(match.knockoutRound)
      if (!key && match.matchdayOrder) {
        key = inferRoundKeyFromMatchday(match.matchdayOrder, totalRounds)
      }
      if (!key) continue
      const list = map.get(key) ?? []
      list.push(match)
      map.set(key, list)
    }
    const order: RoundKey[] = ['R32', 'R16', 'QF', 'SF', 'F']
    for (const key of order) {
      const list = map.get(key)
      if (!list) continue
      list.sort((a, b) => (a.matchdayOrder ?? 0) - (b.matchdayOrder ?? 0))
    }
    return order.map((key) => ({ key, label: roundLabel(key), matches: map.get(key) ?? [] })).filter((col) => col.matches.length > 0)
  }, [effectiveKnockoutMatches, uniqueKnockoutRounds.length])

  const bracketGrid = useMemo(() => bracketColumns.length === 0 ? null : makeBracketGrid(bracketColumns), [bracketColumns])
  const bracketGraph = useMemo(() => bracketColumns.length === 0 ? null : buildBracketGraph(bracketColumns), [bracketColumns])

  const bracketHighlightSet = useMemo(() => {
    if (!bracketGraph || !hoveredBracketMatchId) return null
    const { forward, backward } = buildAdjacency(bracketGraph.edges)
    const up = collectReachable(hoveredBracketMatchId, backward)
    const down = collectReachable(hoveredBracketMatchId, forward)
    const combined = new Set<string>()
    for (const id of up) combined.add(id)
    for (const id of down) combined.add(id)
    return combined
  }, [bracketGraph, hoveredBracketMatchId])

  const knockoutByPhase = useMemo(() => groupKnockoutByPhase(effectiveKnockoutMatches), [effectiveKnockoutMatches])
  const seasonNumber = seasons.find((s) => s.id === selectedSeason)?.number

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="bg-gradient-to-b from-foreground/5 to-transparent px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Kempes Web / Fixtures</div>
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold leading-tight">Fixture</h1>
                    <p className="text-sm text-muted-foreground">Ligas y copas, por fecha o equipo</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCompetitionType?.format && (
                  <Badge variant="outline" className="bg-background">
                    {competitionFormatLabel(selectedCompetitionType.format)}
                  </Badge>
                )}
                {seasonNumber && <Badge variant="secondary">Temporada T{seasonNumber}</Badge>}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="border-t bg-background px-5 py-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1 min-w-[140px]">
                <div className="text-[11px] font-semibold text-muted-foreground">TEMPORADA</div>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecciona una temporada" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        T{season.number} {season.isActive && '(Activa)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 flex-1 min-w-[200px] max-w-[320px]">
                <div className="text-[11px] font-semibold text-muted-foreground">TORNEO</div>
                <Select
                  value={selectedCompetition}
                  onValueChange={setSelectedCompetition}
                  disabled={!selectedSeason || competitions.length === 0}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecciona un torneo" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitions.map((comp) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        <span className="truncate">{formatCompetitionLabel(seasonNumber, comp.name)}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group filter - only shown for cups with groups */}
              {hasGroups && (
                <div className="space-y-1 min-w-[160px]">
                  <div className="text-[11px] font-semibold text-muted-foreground">GRUPO</div>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Todos los grupos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los grupos</SelectItem>
                      {availableGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {formatGroupName(group)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground">VISTA</div>
                <div className="flex gap-2">
                  {/* Liga o Fase de Grupos: solo Fechas y Equipo */}
                  {(competitionMode === 'ROUND_ROBIN_ONLY' || competitionMode === 'GROUPS_ONLY') && (
                    <>
                      <Button variant={viewMode === 'byDate' ? 'default' : 'outline'} onClick={() => setViewMode('byDate')} className="h-10">Fechas</Button>
                      <Button variant={viewMode === 'byTeam' ? 'default' : 'outline'} onClick={() => setViewMode('byTeam')} className="h-10">Equipo</Button>
                    </>
                  )}
                  {/* Copa de eliminación directa: Fases y Bracket */}
                  {competitionMode === 'KNOCKOUT_ONLY' && (
                    <>
                      <Button variant={viewMode === 'byPhase' ? 'default' : 'outline'} onClick={() => setViewMode('byPhase')} className="h-10">Fases</Button>
                      <Button variant={viewMode === 'bracket' ? 'default' : 'outline'} onClick={() => setViewMode('bracket')} className="h-10">Bracket</Button>
                    </>
                  )}
                  {/* Copa con grupos Y knockout (Copa Kempes completa): todos los botones */}
                  {competitionMode === 'GROUPS_AND_KNOCKOUT' && (
                    <>
                      <Button variant={viewMode === 'byDate' ? 'default' : 'outline'} onClick={() => setViewMode('byDate')} className="h-10">Fechas</Button>
                      <Button variant={viewMode === 'byPhase' ? 'default' : 'outline'} onClick={() => setViewMode('byPhase')} className="h-10">Fases</Button>
                      <Button variant={viewMode === 'bracket' ? 'default' : 'outline'} onClick={() => setViewMode('bracket')} className="h-10">Bracket</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          <div className="space-y-4">
            {/* Competition info card */}
            {selectedCompetitionObj && (
              <div className="rounded-xl border bg-card">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Torneo</div>
                    <div className="truncate text-base font-semibold">{formatCompetitionLabel(seasonNumber, selectedCompetitionObj.name)}</div>
                  </div>
                  <Badge variant="secondary" className="gap-2">
                    <Trophy className="h-4 w-4" />
                    {competitionPresentation === 'CUP' ? 'Copa' : 'Liga'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 px-4 py-3 text-center">
                  <div className="rounded-lg bg-muted/30 py-2">
                    <div className="text-[11px] font-semibold text-muted-foreground">
                      {competitionMode === 'KNOCKOUT_ONLY' ? 'Partidos' : 'Equipos'}
                    </div>
                    <div className="text-lg font-semibold">
                      {competitionMode === 'KNOCKOUT_ONLY' 
                        ? effectiveKnockoutMatches.length
                        : getTeamsFromMatches().length}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/30 py-2">
                    <div className="text-[11px] font-semibold text-muted-foreground">
                      {competitionMode === 'KNOCKOUT_ONLY' ? 'Fases' : 
                       competitionMode === 'GROUPS_ONLY' || competitionMode === 'GROUPS_AND_KNOCKOUT' ? 'Grupos' : 
                       'Fechas'}
                    </div>
                    <div className="text-lg font-semibold">
                      {competitionMode === 'KNOCKOUT_ONLY' 
                        ? uniqueKnockoutRounds.length
                        : competitionMode === 'GROUPS_ONLY' || competitionMode === 'GROUPS_AND_KNOCKOUT' 
                          ? availableGroups.length
                          : totalMatchdays}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/30 py-2">
                    <div className="text-[11px] font-semibold text-muted-foreground">Formato</div>
                    <div className="text-lg font-semibold">{competitionFormatLabel(selectedCompetitionType?.format)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Match views */}
            {!isLoading && (matches.length > 0 || knockoutMatches.length > 0) && (
              <>
                {/* LEAGUE/GROUPS: by date */}
                {viewMode === 'byDate' && (competitionMode === 'ROUND_ROBIN_ONLY' || competitionMode === 'GROUPS_ONLY' || competitionMode === 'GROUPS_AND_KNOCKOUT') && (
                  <>
                    {/* If it has groups, show grouped view */}
                    {hasGroups ? (
                      selectedGroup === 'ALL' ? (
                        // Show all groups separated, each with matchday navigation
                        <div className="space-y-4">
                          {availableGroups.map((group) => (
                            <div key={group} className="rounded-xl border bg-card">
                              <div className="flex items-center justify-between gap-3 border-b px-4 py-3 bg-muted/30">
                                <div className="text-sm font-semibold">{formatGroupName(group)}</div>
                                <Badge variant="outline">{matches.filter(m => m.homePlaceholder === group).length} partidos</Badge>
                              </div>
                              {/* Show all matchdays for this group */}
                              {[...new Set(matches.filter(m => m.homePlaceholder === group).map(m => m.matchdayOrder))].sort((a, b) => a - b).map((matchday) => (
                                <div key={matchday}>
                                  <div className="px-4 py-2 bg-muted/10 text-xs font-medium text-muted-foreground">Fecha {matchday}</div>
                                  <div className="divide-y">
                                    {matches.filter(m => m.homePlaceholder === group && m.matchdayOrder === matchday).map((match) => (
                                      <MatchRow key={match.id} match={match} rightMeta={getStatusBadge(match.status)} />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Show only selected group with matchday navigation
                        <div className="rounded-xl border bg-card">
                          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                            <div className="text-sm font-semibold">{formatGroupName(selectedGroup)} - Fecha</div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => setCurrentMatchday(Math.max(1, currentMatchday - 1))} disabled={currentMatchday === 1}>
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <div className="text-sm"><span className="font-semibold">{currentMatchday}</span><span className="text-muted-foreground"> / {filteredTotalMatchdays}</span></div>
                              <Button variant="outline" size="sm" onClick={() => setCurrentMatchday(Math.min(filteredTotalMatchdays, currentMatchday + 1))} disabled={currentMatchday === filteredTotalMatchdays}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="divide-y">
                            {getFilteredMatchesByMatchday(currentMatchday).map((match) => (
                              <MatchRow key={match.id} match={match} rightMeta={getStatusBadge(match.status)} />
                            ))}
                          </div>
                        </div>
                      )
                    ) : (
                      // No groups - standard league view with matchday navigation
                      <div className="rounded-xl border bg-card">
                        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                          <div className="text-sm font-semibold">Fecha</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentMatchday(Math.max(1, currentMatchday - 1))} disabled={currentMatchday === 1}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-sm"><span className="font-semibold">{currentMatchday}</span><span className="text-muted-foreground"> / {totalMatchdays}</span></div>
                            <Button variant="outline" size="sm" onClick={() => setCurrentMatchday(Math.min(totalMatchdays, currentMatchday + 1))} disabled={currentMatchday === totalMatchdays}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="divide-y">
                          {getMatchesByMatchday(currentMatchday).map((match) => (
                            <MatchRow key={match.id} match={match} rightMeta={getStatusBadge(match.status)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* LEAGUE: by team */}
                {/* LEAGUE/GROUPS: by team */}
                {viewMode === 'byTeam' && (competitionMode === 'ROUND_ROBIN_ONLY' || competitionMode === 'GROUPS_ONLY' || competitionMode === 'GROUPS_AND_KNOCKOUT') && (
                  <div className="rounded-xl border bg-card">
                    <div className="border-b px-4 py-3">
                      <div className="text-sm font-semibold">Equipo</div>
                      <div className="mt-2">
                        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                          <SelectTrigger className="h-10"><SelectValue placeholder="Selecciona un equipo" /></SelectTrigger>
                          <SelectContent>
                            {getTeamsFromMatches().map((teamId) => {
                              const team = matches.find((m) => m.homeClub?.id === teamId)?.homeClub || matches.find((m) => m.awayClub?.id === teamId)?.awayClub
                              return <SelectItem key={teamId} value={teamId}>{team?.name}</SelectItem>
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {selectedTeam ? (
                      <div className="divide-y">
                        {getMatchesByTeam(selectedTeam).map((match) => (
                          <MatchRow key={match.id} match={match} rightMeta={<Badge variant="outline">F{match.matchdayOrder}</Badge>} />
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-center text-sm text-muted-foreground">Elegí un equipo para ver sus partidos.</div>
                    )}
                  </div>
                )}

                {/* CUP: by phase (knockout phases with navigation) */}
                {viewMode === 'byPhase' && (competitionMode === 'KNOCKOUT_ONLY' || competitionMode === 'GROUPS_AND_KNOCKOUT') && (
                  <div className="space-y-6">
                    {/* Knockout phase section */}
                    {effectiveKnockoutMatches.length > 0 && uniqueKnockoutRounds.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Eliminación Directa</Badge>
                        </div>
                        
                        {/* Navigation for phases */}
                        <div className="rounded-xl border bg-card">
                          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                            <div className="text-sm font-semibold">{knockoutRoundLabel(uniqueKnockoutRounds[currentKnockoutPhase])}</div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => setCurrentKnockoutPhase(Math.max(0, currentKnockoutPhase - 1))} disabled={currentKnockoutPhase === 0}>
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <div className="text-sm"><span className="font-semibold">{currentKnockoutPhase + 1}</span><span className="text-muted-foreground"> / {uniqueKnockoutRounds.length}</span></div>
                              <Button variant="outline" size="sm" onClick={() => setCurrentKnockoutPhase(Math.min(uniqueKnockoutRounds.length - 1, currentKnockoutPhase + 1))} disabled={currentKnockoutPhase === uniqueKnockoutRounds.length - 1}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="divide-y">
                            {effectiveKnockoutMatches
                              .filter(m => m.knockoutRound === uniqueKnockoutRounds[currentKnockoutPhase])
                              .map((match) => (
                                <MatchRow key={match.id} match={match} rightMeta={<Badge variant="outline" className="text-[11px]">{knockoutRoundLabel(match.knockoutRound)}</Badge>} />
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {effectiveKnockoutMatches.length === 0 && (
                      <Alert className="w-full">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>No hay partidos de eliminación directa aún.</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* CUP: bracket view */}
                {viewMode === 'bracket' && (competitionMode === 'KNOCKOUT_ONLY' || competitionMode === 'GROUPS_AND_KNOCKOUT') && effectiveKnockoutMatches.length > 0 && (
                  <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="border-b px-4 py-3">
                      <div className="text-sm font-semibold">Bracket de Eliminación</div>
                      <div className="text-xs text-muted-foreground">Vista completa del cuadro eliminatorio</div>
                    </div>
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <div className="min-w-[720px] relative" ref={(el) => setBracketContainerEl(el)}>
                          {bracketGrid && (
                            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${bracketGrid.columns.length}, minmax(0, 1fr))` }}>
                              {bracketGrid.columns.map((col) => (
                                <div key={col.key} className="min-w-0">
                                  <div className="mb-2 flex items-center justify-between">
                                    <div className="text-[11px] font-semibold text-muted-foreground">{col.label}</div>
                                    <Badge variant="secondary" className="text-[11px]">{col.matches.length}</Badge>
                                  </div>
                                  <div className="relative">
                                    {col.key !== 'F' && <div className="pointer-events-none absolute -right-2 top-0 bottom-0 w-px bg-border/70" />}
                                    <div className="grid" style={{ gridTemplateRows: `repeat(${bracketGrid.rows}, 12px)` }}>
                                      {col.cells.map((cell, idx) => {
                                        if (cell.kind === 'spacer') return <div key={idx} />
                                        return (
                                          <div
                                            key={cell.match!.id}
                                            style={{ gridRow: `span 10` }}
                                            className={bracketHighlightSet ? (bracketHighlightSet.has(cell.match!.id) ? '-my-1' : '-my-1 opacity-35') : '-my-1'}
                                            ref={registerBracketCardEl(cell.match!.id)}
                                            onMouseEnter={() => setHoveredBracketMatchId(cell.match!.id)}
                                            onMouseLeave={() => setHoveredBracketMatchId(null)}
                                          >
                                            <BracketCard match={cell.match!} />
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {bracketContainerEl && bracketGrid && bracketGraph && (
                            <>
                              <BracketUConnectors rows={bracketGrid.rows} />
                              <BracketExactConnectors 
                                edges={bracketGraph.edges} 
                                getEl={(id) => bracketCardEls.get(id) ?? null} 
                                containerEl={bracketContainerEl} 
                                highlight={bracketHighlightSet ?? undefined} 
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === 'bracket' && (competitionMode === 'KNOCKOUT_ONLY' || competitionMode === 'GROUPS_AND_KNOCKOUT') && effectiveKnockoutMatches.length === 0 && (
                  <Alert className="w-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No hay partidos de eliminación directa aún. La fase de grupos debe completarse primero.</AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {!isLoading && selectedCompetition && matches.length === 0 && effectiveKnockoutMatches.length === 0 && (
              <Alert className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No hay partidos disponibles para esta competición. Asegúrate de haber creado los fixtures.</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
