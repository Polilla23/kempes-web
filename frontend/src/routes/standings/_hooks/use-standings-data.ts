import { useState, useEffect, useMemo } from 'react'
import { SeasonService } from '@/services/season.service'
import CompetitionService from '@/services/competition.service'
import StandingsService, {
  type CompetitionStandings,
  type CupGroupsStatusResponse,
} from '@/services/standings.service'
import { FixtureService } from '@/services/fixture.service'
import type {
  StandingsFilterState,
  CompetitionOption,
  BracketMatch,
  BracketRound,
} from '../_types/standings.types'
import {
  CATEGORY_MAP,
  FORMAT_MAP,
  ROUND_ORDER,
  ROUND_LABELS,
} from '../_types/standings.types'

interface Season {
  id: string
  number: number
  isActive: boolean
}

export function useStandingsData(filters: StandingsFilterState) {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [allCompetitions, setAllCompetitions] = useState<CompetitionOption[]>([])
  const [leagueStandings, setLeagueStandings] = useState<CompetitionStandings | null>(null)
  const [cupGroupsData, setCupGroupsData] = useState<CupGroupsStatusResponse | null>(null)
  const [bracketData, setBracketData] = useState<BracketRound[] | null>(null)
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true)
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false)
  const [isLoadingStandings, setIsLoadingStandings] = useState(false)

  // Cargar temporadas al montar
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const response = await SeasonService.getSeasons()
        setSeasons(response.seasons || [])
      } catch (err) {
        console.error('Error loading seasons:', err)
      } finally {
        setIsLoadingSeasons(false)
      }
    }
    loadSeasons()
  }, [])

  // Cargar competencias cuando cambia la temporada
  useEffect(() => {
    if (!filters.selectedSeason) return

    const loadCompetitions = async () => {
      setIsLoadingCompetitions(true)
      try {
        const response = await CompetitionService.getCompetitions()

        const filtered =
          response.data
            ?.filter((c: any) => c.seasonId === filters.selectedSeason)
            .map((c: any) => {
              const compType = c.competitionType || c.type
              return {
                id: c.id,
                name: c.name,
                category: compType?.category?.toUpperCase() || '',
                format: compType?.format?.toUpperCase() || '',
                hierarchy: compType?.hierarchy ?? 999,
                system: c.system || '',
                parentCompetitionId: c.parentCompetitionId || null,
              }
            })
            .sort((a: CompetitionOption, b: CompetitionOption) => {
              if (a.hierarchy !== b.hierarchy) return a.hierarchy - b.hierarchy
              return a.name.localeCompare(b.name)
            }) || []

        setAllCompetitions(filtered)
      } catch (err) {
        console.error('Error loading competitions:', err)
      } finally {
        setIsLoadingCompetitions(false)
      }
    }
    loadCompetitions()
  }, [filters.selectedSeason])

  // Filtrar competencias por categoría y tipo
  const filteredCompetitions = useMemo(() => {
    const allowedCategories = CATEGORY_MAP[filters.selectedCategory]
    const allowedFormat = FORMAT_MAP[filters.selectedType]

    return allCompetitions.filter((comp) => {
      const categoryMatch = allowedCategories.includes(comp.category)
      const formatMatch = comp.format === allowedFormat
      return categoryMatch && formatMatch
    })
  }, [allCompetitions, filters.selectedCategory, filters.selectedType])

  // Cargar standings cuando cambia la competición seleccionada
  useEffect(() => {
    if (!filters.selectedCompetition) {
      setLeagueStandings(null)
      setCupGroupsData(null)
      setBracketData(null)
      return
    }

    const competition = allCompetitions.find((c) => c.id === filters.selectedCompetition)
    if (!competition) return

    const loadStandings = async () => {
      setIsLoadingStandings(true)
      setLeagueStandings(null)
      setCupGroupsData(null)
      setBracketData(null)

      try {
        if (competition.format === 'LEAGUE') {
          // Liga: tabla de posiciones estándar
          const response = await StandingsService.getCompetitionStandings(competition.id)
          setLeagueStandings(response.data)
        } else if (competition.format === 'CUP') {
          if (competition.system === 'ROUND_ROBIN') {
            // Copa con fase de grupos (Copa Kempes)
            const response = await StandingsService.getCupGroupStandings(competition.id)
            setCupGroupsData(response.data)
          } else {
            // KNOCKOUT: cargar bracket
            const matches = await FixtureService.getKnockoutBracket(competition.id)
            const knockoutMatches = matches as BracketMatch[]

            // Transformar a BracketRound[]
            const rounds: Record<string, BracketMatch[]> = {}
            knockoutMatches.forEach((match) => {
              const round = match.knockoutRound || 'UNKNOWN'
              if (!rounds[round]) rounds[round] = []

              let winner: 'home' | 'away' | 'draw' | undefined
              if (match.status === 'FINALIZADO') {
                if (match.homeClubGoals > match.awayClubGoals) winner = 'home'
                else if (match.awayClubGoals > match.homeClubGoals) winner = 'away'
                else winner = 'draw'
              }

              rounds[round].push({ ...match, winner })
            })

            const bracketRounds = ROUND_ORDER
              .filter((r) => rounds[r] && rounds[r].length > 0)
              .map((r) => ({
                name: ROUND_LABELS[r] || r,
                roundKey: r,
                matches: rounds[r].sort((a, b) => a.matchdayOrder - b.matchdayOrder),
              }))

            setBracketData(bracketRounds.length > 0 ? bracketRounds : null)
          }
        }
      } catch (err) {
        console.error('Error loading standings:', err)
      } finally {
        setIsLoadingStandings(false)
      }
    }
    loadStandings()
  }, [filters.selectedCompetition, allCompetitions])

  // Obtener temporada activa
  const activeSeason = useMemo(() => {
    return seasons.find((s) => s.isActive)
  }, [seasons])

  // Obtener número de temporada seleccionada
  const currentSeasonNumber = useMemo(() => {
    return seasons.find((s) => s.id === filters.selectedSeason)?.number
  }, [seasons, filters.selectedSeason])

  // Obtener la competición seleccionada actual
  const selectedCompetitionData = useMemo(() => {
    return allCompetitions.find((c) => c.id === filters.selectedCompetition) || null
  }, [allCompetitions, filters.selectedCompetition])

  return {
    seasons,
    allCompetitions,
    filteredCompetitions,
    leagueStandings,
    cupGroupsData,
    bracketData,
    selectedCompetitionData,
    isLoadingSeasons,
    isLoadingCompetitions,
    isLoadingStandings,
    activeSeason,
    currentSeasonNumber,
  }
}
