import { useState, useCallback } from 'react'
import type {
  StandingsFilterState,
  Category,
  CompetitionTypeFilter,
} from '../_types/standings.types'

export function useStandingsFilters(initialSeason: string = '') {
  const [filters, setFilters] = useState<StandingsFilterState>({
    selectedSeason: initialSeason,
    selectedCategory: 'mayores',
    selectedType: 'liga',
    selectedCompetition: '',
  })

  const setSelectedSeason = useCallback((seasonId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedSeason: seasonId,
      selectedCompetition: '', // Reset al cambiar temporada
    }))
  }, [])

  const setSelectedCategory = useCallback((category: Category) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategory: category,
      selectedCompetition: '', // Reset al cambiar categoría
    }))
  }, [])

  const setSelectedType = useCallback((type: CompetitionTypeFilter) => {
    setFilters((prev) => ({
      ...prev,
      selectedType: type,
      selectedCompetition: '', // Reset al cambiar tipo
    }))
  }, [])

  const setSelectedCompetition = useCallback((competitionId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCompetition: competitionId,
    }))
  }, [])

  return {
    filters,
    setSelectedSeason,
    setSelectedCategory,
    setSelectedType,
    setSelectedCompetition,
  }
}
