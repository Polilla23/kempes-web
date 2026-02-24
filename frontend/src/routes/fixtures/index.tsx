import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { checkAuth } from '@/services/auth-guard'

// Hooks locales
import { useFixturesFilters } from './_hooks/use-fixtures-filters'
import { useFixturesData } from './_hooks/use-fixtures-data'

// Componentes locales
import { FixturesFilterBar } from './_components/fixtures-filter-bar'
import { FixturesListView } from './_components/fixtures-list-view'
import { FixturesSkeleton } from './_components/fixtures-skeleton'

export const Route = createFileRoute('/fixtures/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: FixturesPage,
})

function FixturesPage() {
  // Estado de filtros centralizado
  const {
    filters,
    setSelectedSeason,
    setSelectedCompetition,
    setSelectedCategory,
    setSelectedType,
    setSelectedStatus,
  } = useFixturesFilters()

  // Datos de fixtures (UNA sola llamada API para toda la temporada)
  const {
    seasons,
    filteredCompetitions,
    groupedMatches,
    isLoadingSeasons,
    isLoadingMatches,
    activeSeason,
    currentSeasonNumber,
  } = useFixturesData(filters)

  // Establecer temporada activa cuando se cargan las temporadas
  useEffect(() => {
    if (activeSeason && !filters.selectedSeason) {
      setSelectedSeason(activeSeason.id)
    }
  }, [activeSeason, filters.selectedSeason, setSelectedSeason])

  const isLoading = isLoadingSeasons || isLoadingMatches

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[5%] lg:px-[7%] xl:px-[10%] py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fixtures y Resultados</h1>
            <p className="text-muted-foreground mt-1">
              Todos los partidos de la temporada {currentSeasonNumber ? `T${currentSeasonNumber}` : ''}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <FixturesFilterBar
          filters={filters}
          filteredCompetitions={filteredCompetitions}
          seasons={seasons}
          onSeasonChange={setSelectedSeason}
          onCategoryChange={setSelectedCategory}
          onTypeChange={setSelectedType}
          onCompetitionChange={setSelectedCompetition}
          onStatusChange={setSelectedStatus}
        />

        {/* Content */}
        {isLoading ? (
          <FixturesSkeleton />
        ) : (
          <FixturesListView groupedMatches={groupedMatches} />
        )}
      </div>
    </div>
  )
}
