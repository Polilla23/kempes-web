import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { checkAuth } from '@/services/auth-guard'

// Hooks locales
import { useStandingsFilters } from './_hooks/use-standings-filters'
import { useStandingsData } from './_hooks/use-standings-data'

// Componentes locales
import { StandingsFilterBar } from './_components/standings-filter-bar'
import { StandingsTable } from './_components/standings-table'
import { StandingsCupGroups } from './_components/standings-cup-groups'
import { StandingsCupCombined } from './_components/standings-cup-combined'
import { StandingsSkeleton } from './_components/standings-skeleton'
import { StandingsLegend } from './_components/standings-legend'
import { StandingsBracketView } from './_components/standings-bracket-view'

export const Route = createFileRoute('/standings/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: StandingsPage,
})

function StandingsPage() {
  // Estado de filtros centralizado
  const {
    filters,
    setSelectedSeason,
    setSelectedCategory,
    setSelectedType,
    setSelectedCompetition,
  } = useStandingsFilters()

  // Datos
  const {
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
  } = useStandingsData(filters)

  // Establecer temporada activa al cargar
  useEffect(() => {
    if (activeSeason && !filters.selectedSeason) {
      setSelectedSeason(activeSeason.id)
    }
  }, [activeSeason, filters.selectedSeason, setSelectedSeason])

  // Auto-seleccionar la primera competición disponible cuando cambian los filtros
  useEffect(() => {
    if (filteredCompetitions.length > 0 && !filters.selectedCompetition) {
      setSelectedCompetition(filteredCompetitions[0].id)
    }
    // Si la competición seleccionada ya no está en la lista filtrada, resetear
    if (
      filters.selectedCompetition &&
      filteredCompetitions.length > 0 &&
      !filteredCompetitions.find((c) => c.id === filters.selectedCompetition)
    ) {
      setSelectedCompetition(filteredCompetitions[0].id)
    }
  }, [filteredCompetitions, filters.selectedCompetition, setSelectedCompetition])

  const isLoading = isLoadingSeasons || isLoadingCompetitions

  // Determinar título y subtítulo dinámicos
  const pageTitle = selectedCompetitionData?.name || 'Tabla de Posiciones'
  const pageSubtitle = currentSeasonNumber
    ? `Temporada ${currentSeasonNumber}`
    : ''

  // Info de progreso para ligas
  const progressInfo = leagueStandings
    ? `${leagueStandings.matchesPlayed} de ${leagueStandings.matchesTotal} partidos jugados`
    : ''

  // Determinar si es knockout (sin tabla de posiciones)
  const isKnockout =
    selectedCompetitionData?.format === 'CUP' &&
    selectedCompetitionData?.system === 'KNOCKOUT'

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[5%] lg:px-[7%] xl:px-[10%] py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground mt-1">
              {pageSubtitle}
              {progressInfo && ` · ${progressInfo}`}
              {leagueStandings?.isComplete && (
                <Badge variant="secondary" className="ml-2">
                  Finalizado
                </Badge>
              )}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <StandingsFilterBar
          filters={filters}
          filteredCompetitions={filteredCompetitions}
          seasons={seasons}
          onSeasonChange={setSelectedSeason}
          onCategoryChange={setSelectedCategory}
          onTypeChange={setSelectedType}
          onCompetitionChange={setSelectedCompetition}
        />

        {/* Content */}
        {isLoading || isLoadingStandings ? (
          <StandingsSkeleton />
        ) : !filters.selectedCompetition || filteredCompetitions.length === 0 ? (
          <EmptyState />
        ) : isKnockout ? (
          <StandingsBracketView
            bracketData={bracketData ?? []}
            competitionName={selectedCompetitionData?.name}
            seasonNumber={currentSeasonNumber}
            isLoading={isLoadingStandings}
          />
        ) : leagueStandings ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <StandingsTable standings={leagueStandings.standings} />
              </CardContent>
            </Card>
            <StandingsLegend type="league" />
          </>
        ) : cupGroupsData ? (
          <>
            <StandingsCupCombined
              cupGroupsData={cupGroupsData}
              competitionId={filters.selectedCompetition}
              allCompetitions={allCompetitions}
            />
            <StandingsLegend type="cup-groups" />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Users className="h-12 w-12 mb-4" />
          <p className="text-lg">No hay competiciones disponibles</p>
          <p className="text-sm">
            Las tablas de posiciones aparecerán cuando haya competiciones con partidos
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

