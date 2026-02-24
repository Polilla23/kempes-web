import { useState, useCallback } from 'react'
import type {
  FilterState,
  Category,
  CompetitionTypeFilter,
  MatchStatus,
} from '../_types/fixtures.types'

export function useFixturesFilters(initialSeason: string = '') {
  const [filters, setFilters] = useState<FilterState>({
    selectedSeason: initialSeason,
    selectedCompetition: 'all',
    selectedCategory: 'mayores',
    selectedType: 'liga',
    selectedStatus: 'all',
  })

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // Reset filters que dependen de la categoría/tipo cuando cambian
  const setSelectedCategory = useCallback((category: Category) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategory: category,
      selectedCompetition: 'all', // Reset competition al cambiar categoría
      // Para Supercopa, forzar tipo a 'copa' ya que solo hay copas
      selectedType: category === 'supercopa' ? 'copa' : prev.selectedType,
    }))
  }, [])

  const setSelectedType = useCallback((type: CompetitionTypeFilter) => {
    setFilters((prev) => ({
      ...prev,
      selectedType: type,
      selectedCompetition: 'all', // Reset competition al cambiar tipo
    }))
  }, [])

  const setSelectedSeason = useCallback((seasonId: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedSeason: seasonId,
      selectedCompetition: 'all', // Reset competition al cambiar temporada
    }))
  }, [])

  return {
    filters,
    setSelectedSeason,
    setSelectedCompetition: (v: string) => updateFilter('selectedCompetition', v),
    setSelectedCategory,
    setSelectedType,
    setSelectedStatus: (v: MatchStatus) => updateFilter('selectedStatus', v),
  }
}
