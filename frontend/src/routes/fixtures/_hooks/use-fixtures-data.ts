import { useState, useEffect, useMemo } from 'react'
import { SeasonService } from '@/services/season.service'
import CompetitionService from '@/services/competition.service'
import { FixtureService, type MatchDetailedDTO } from '@/services/fixture.service'
import type {
  FilterState,
  Match,
  CompetitionOption,
  GroupedMatches,
} from '../_types/fixtures.types'
import { CATEGORY_MAP as CategoryMap } from '../_types/fixtures.types'

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
                typeName: compType?.name?.toUpperCase() || '',
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
          typeName: m.competition.competitionType?.name?.toUpperCase() || '',
        })
      }
    })

    return Array.from(compMap.values()).sort((a, b) => {
      if (a.hierarchy !== b.hierarchy) return a.hierarchy - b.hierarchy
      return a.name.localeCompare(b.name)
    })
  }, [allMatches])

  // Determinar si una competencia tiene partidos knockout (para mostrarla en Definiciones)
  const competitionsWithKnockout = useMemo(() => {
    const ids = new Set<string>()
    allMatches.forEach((m) => {
      if (m.stage === 'KNOCKOUT') ids.add(m.competitionId)
    })
    return ids
  }, [allMatches])

  // FILTRADO CLIENT-SIDE: Filtrar competencias por categoría y tipo
  const filteredCompetitions = useMemo(() => {
    const allowedCategories = CategoryMap[filters.selectedCategory]

    return competitionsFromMatches.filter((comp) => {
      const categoryMatch = allowedCategories.includes(comp.category)
      if (!categoryMatch) return false

      // Para Supercopa (MIXED), no filtrar por formato ya que solo hay CUP
      if (filters.selectedCategory === 'supercopa') return true

      switch (filters.selectedType) {
        case 'liga':
          return comp.format === 'LEAGUE'
        case 'copa':
          return comp.format === 'CUP' && comp.typeName !== 'PROMOTIONS'
        case 'definiciones':
          // Ligas que tienen partidos knockout + promociones
          return (comp.format === 'LEAGUE' && competitionsWithKnockout.has(comp.id)) ||
            comp.typeName === 'PROMOTIONS'
        default:
          return true
      }
    })
  }, [competitionsFromMatches, filters.selectedCategory, filters.selectedType, competitionsWithKnockout])

  // FILTRADO CLIENT-SIDE: Filtrar partidos USANDO la data embebida del match
  const filteredMatches = useMemo(() => {
    let result = allMatches

    const allowedCategories = CategoryMap[filters.selectedCategory]

    // Filtrar por competencia específica o por categoría/tipo
    if (filters.selectedCompetition !== 'all') {
      result = result.filter((m) => m.competitionId === filters.selectedCompetition)

      // Para Definiciones con competencia liga seleccionada, mostrar solo knockout
      if (filters.selectedType === 'definiciones') {
        const comp = competitionsFromMatches.find((c) => c.id === filters.selectedCompetition)
        if (comp?.format === 'LEAGUE') {
          result = result.filter((m) => m.stage === 'KNOCKOUT')
        }
      }
      // Para Liga con competencia seleccionada, excluir knockout
      if (filters.selectedType === 'liga') {
        result = result.filter((m) => m.stage !== 'KNOCKOUT')
      }
    } else {
      // Filtrar usando la info embebida en cada match
      result = result.filter((m) => {
        const matchCategory = m.competition?.competitionType?.category?.toUpperCase()
        const matchFormat = m.competition?.competitionType?.format?.toUpperCase()
        const matchTypeName = m.competition?.competitionType?.name?.toUpperCase()

        const categoryMatch = allowedCategories.includes(matchCategory || '')
        if (!categoryMatch) return false

        // Para Supercopa (MIXED), ignorar formato
        if (filters.selectedCategory === 'supercopa') return true

        switch (filters.selectedType) {
          case 'liga':
            return matchFormat === 'LEAGUE' && m.stage !== 'KNOCKOUT'
          case 'copa':
            return matchFormat === 'CUP' && matchTypeName !== 'PROMOTIONS'
          case 'definiciones':
            return (matchFormat === 'LEAGUE' && m.stage === 'KNOCKOUT') ||
              matchTypeName === 'PROMOTIONS'
          default:
            return true
        }
      })
    }

    // Filtrar por estado
    if (filters.selectedStatus === 'played') {
      result = result.filter((m) => m.status === 'FINALIZADO')
    } else if (filters.selectedStatus === 'pending') {
      result = result.filter((m) => m.status === 'PENDIENTE')
    } else if (filters.selectedStatus === 'cancelled') {
      result = result.filter((m) => m.status === 'CANCELADO')
    }

    return result
  }, [allMatches, filters.selectedCompetition, filters.selectedStatus, filters.selectedCategory, filters.selectedType, competitionsFromMatches])

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
