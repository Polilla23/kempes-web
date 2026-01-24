import { useState, useEffect, useMemo } from 'react'
import { SeasonService } from '@/services/season.service'
import CompetitionService from '@/services/competition.service'
import { FixtureService, type MatchDetailedDTO } from '@/services/fixture.service'
import type {
  FilterState,
  Match,
  CompetitionOption,
  GroupedMatches,
  CATEGORY_MAP,
  FORMAT_MAP,
} from '../_types/fixtures.types'
import { CATEGORY_MAP as CategoryMap, FORMAT_MAP as FormatMap } from '../_types/fixtures.types'

interface Season {
  id: string
  number: number
  isActive: boolean
}

export function useFixturesData(filters: FilterState) {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [competitions, setCompetitions] = useState<CompetitionOption[]>([])
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true)
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)

  // Cargar temporadas una vez al montar
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
              }
            })
            .sort((a: CompetitionOption, b: CompetitionOption) => {
              if (a.hierarchy !== b.hierarchy) return a.hierarchy - b.hierarchy
              return a.name.localeCompare(b.name)
            }) || []

        setCompetitions(filtered)
      } catch (err) {
        console.error('Error loading competitions:', err)
      }
    }
    loadCompetitions()
  }, [filters.selectedSeason])

  // UNA SOLA LLAMADA: Cargar TODOS los partidos de la temporada
  useEffect(() => {
    if (!filters.selectedSeason) return

    const loadAllMatches = async () => {
      setIsLoadingMatches(true)
      try {
        const matches = await FixtureService.getSeasonMatches(filters.selectedSeason)
        setAllMatches(matches as Match[])
      } catch (err) {
        console.error('Error loading matches:', err)
        setAllMatches([])
      } finally {
        setIsLoadingMatches(false)
      }
    }
    loadAllMatches()
  }, [filters.selectedSeason])

  // CONSTRUIR lista de competencias únicas desde los matches
  // Esto garantiza que solo mostramos competencias que realmente tienen partidos
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

    return Array.from(compMap.values()).sort((a, b) => {
      if (a.hierarchy !== b.hierarchy) return a.hierarchy - b.hierarchy
      return a.name.localeCompare(b.name)
    })
  }, [allMatches])

  // FILTRADO CLIENT-SIDE: Filtrar competencias por categoría y tipo
  const filteredCompetitions = useMemo(() => {
    const allowedCategories = CategoryMap[filters.selectedCategory]
    const allowedFormat = FormatMap[filters.selectedType]

    return competitionsFromMatches.filter((comp) => {
      const categoryMatch = allowedCategories.includes(comp.category)
      // Para Supercopa (MIXED), no filtrar por formato ya que solo hay CUP
      const formatMatch =
        filters.selectedCategory === 'supercopa' || comp.format === allowedFormat
      return categoryMatch && formatMatch
    })
  }, [competitionsFromMatches, filters.selectedCategory, filters.selectedType])

  // FILTRADO CLIENT-SIDE: Filtrar partidos USANDO la data embebida del match
  const filteredMatches = useMemo(() => {
    let result = allMatches

    const allowedCategories = CategoryMap[filters.selectedCategory]
    const allowedFormat = FormatMap[filters.selectedType]

    // Filtrar por competencia específica o por categoría/tipo
    if (filters.selectedCompetition !== 'all') {
      result = result.filter((m) => m.competitionId === filters.selectedCompetition)
    } else {
      // Filtrar usando la info embebida en cada match
      result = result.filter((m) => {
        const matchCategory = m.competition?.competitionType?.category?.toUpperCase()
        const matchFormat = m.competition?.competitionType?.format?.toUpperCase()

        const categoryMatch = allowedCategories.includes(matchCategory || '')
        // Para Supercopa (MIXED), ignorar formato
        const formatMatch =
          filters.selectedCategory === 'supercopa' || matchFormat === allowedFormat

        return categoryMatch && formatMatch
      })
    }

    // Filtrar por estado
    if (filters.selectedStatus === 'played') {
      result = result.filter((m) => m.status === 'FINALIZADO')
    } else if (filters.selectedStatus === 'pending') {
      result = result.filter((m) => m.status === 'PENDIENTE')
    }

    return result
  }, [allMatches, filters.selectedCompetition, filters.selectedStatus, filters.selectedCategory, filters.selectedType])

  // Agrupar partidos por competencia para vista lista
  const groupedMatches = useMemo((): GroupedMatches => {
    const groups: GroupedMatches = {}

    filteredMatches.forEach((match) => {
      const key = match.competitionId
      const name = match.competition?.name || 'Competencia'

      if (!groups[key]) {
        groups[key] = { name, matches: [] }
      }
      groups[key].matches.push(match)
    })

    return groups
  }, [filteredMatches])

  // Obtener temporada activa
  const activeSeason = useMemo(() => {
    return seasons.find((s) => s.isActive)
  }, [seasons])

  // Obtener número de temporada actual
  const currentSeasonNumber = useMemo(() => {
    return seasons.find((s) => s.id === filters.selectedSeason)?.number
  }, [seasons, filters.selectedSeason])

  return {
    seasons,
    allMatches,
    competitions,
    filteredCompetitions,
    filteredMatches,
    groupedMatches,
    isLoadingSeasons,
    isLoadingMatches,
    activeSeason,
    currentSeasonNumber,
  }
}
