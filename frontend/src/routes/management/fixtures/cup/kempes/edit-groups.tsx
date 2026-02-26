import { useState, useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Loader2, AlertCircle, Users, Trophy, Dice5 } from 'lucide-react'
import { toast } from 'sonner'
import { FixtureService } from '@/services/fixture.service'
import type { AvailableTeam, GroupAssignment } from '@/types/fixture'
import { DroppableLeagueZone } from '../../league/_components/droppable-league-zone'
import { DraggableTeam } from '../../league/_components/draggable-team'
import { SorteoDrawModal } from '../_components/sorteo-draw-modal'
import { checkAuth } from '@/services/auth-guard'

export const Route = createFileRoute('/management/fixtures/cup/kempes/edit-groups')({
  validateSearch: (search: Record<string, unknown>) => ({
    competitionId: (search.competitionId as string) || '',
  }),
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: EditGroupsPage,
})

function EditGroupsPage() {
  const { t } = useTranslation('fixtures')
  const navigate = useNavigate()
  const { competitionId } = Route.useSearch()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPlayedMatches, setHasPlayedMatches] = useState(false)
  const [competitionName, setCompetitionName] = useState('')
  const [groupAssignments, setGroupAssignments] = useState<GroupAssignment>({})
  const [availableTeams, setAvailableTeams] = useState<AvailableTeam[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sorteoOpen, setSorteoOpen] = useState(false)
  const hasLoadedRef = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  // Load current groups from competition matches
  useEffect(() => {
    if (!competitionId || hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const groupsStatus = await FixtureService.getKempesCupGroupsStatus(competitionId)
        setCompetitionName(groupsStatus.competitionName)

        const anyPlayed = groupsStatus.groups.some((g) => g.matchesPlayed > 0)
        setHasPlayedMatches(anyPlayed)

        if (anyPlayed) {
          setError(t('cup.editGroups.hasPlayedMatches'))
          setIsLoading(false)
          return
        }

        // Reconstruct group assignments from standings
        const assignments: GroupAssignment = {}

        for (const group of groupsStatus.groups) {
          const teams: AvailableTeam[] = group.standings.map((s) => ({
            id: s.clubId,
            name: s.clubName,
            logo: s.clubLogo,
            isAssigned: true,
          }))
          assignments[group.groupName] = teams
        }

        setGroupAssignments(assignments)
        setAvailableTeams([])
      } catch (err: any) {
        console.error('Error loading groups:', err)
        setError(err.message || 'Error loading competition data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [competitionId, t])

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const teamId = active.id as string
    const targetGroupId = over.id as string

    // Find team in current location
    let team: AvailableTeam | undefined
    let sourceGroupId: string | undefined

    // Check available teams pool
    const availableIndex = availableTeams.findIndex((t) => t.id === teamId)
    if (availableIndex !== -1) {
      team = availableTeams[availableIndex]
    }

    // Check groups
    if (!team) {
      for (const [groupId, teams] of Object.entries(groupAssignments)) {
        const idx = teams.findIndex((t) => t.id === teamId)
        if (idx !== -1) {
          team = teams[idx]
          sourceGroupId = groupId
          break
        }
      }
    }

    if (!team) return

    // Remove from source
    if (availableIndex !== -1) {
      setAvailableTeams((prev) => prev.filter((t) => t.id !== teamId))
    } else if (sourceGroupId) {
      setGroupAssignments((prev) => ({
        ...prev,
        [sourceGroupId!]: prev[sourceGroupId!].filter((t) => t.id !== teamId),
      }))
    }

    // Add to target
    if (targetGroupId === 'available') {
      setAvailableTeams((prev) => [...prev, { ...team!, isAssigned: false }])
    } else if (groupAssignments[targetGroupId]) {
      setGroupAssignments((prev) => ({
        ...prev,
        [targetGroupId]: [...prev[targetGroupId], { ...team!, isAssigned: true }],
      }))
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const groups = Object.entries(groupAssignments).map(([groupName, teams]) => ({
        groupName,
        clubIds: teams.map((t) => t.id),
      }))

      if (availableTeams.length > 0) {
        setError('All teams must be assigned to groups before saving')
        setIsSaving(false)
        return
      }

      for (const group of groups) {
        if (group.clubIds.length < 2) {
          setError(`Group ${group.groupName} must have at least 2 teams`)
          setIsSaving(false)
          return
        }
      }

      await FixtureService.reassignKempesCupGroups(competitionId, groups)
      toast.success(t('cup.editGroups.success'))
      navigate({ to: '/management/competitions' })
    } catch (err: any) {
      console.error('Error saving groups:', err)
      setError(err.message || t('cup.editGroups.error'))
    } finally {
      setIsSaving(false)
    }
  }

  // Handle sorteo completion
  const handleSorteoComplete = (assignments: GroupAssignment) => {
    setGroupAssignments(assignments)
    setAvailableTeams([])
  }

  // Find active team for overlay
  const activeTeam = activeId
    ? availableTeams.find((t) => t.id === activeId) ||
      Object.values(groupAssignments)
        .flat()
        .find((t) => t.id === activeId)
    : null

  // Computed values
  const numGroups = Object.keys(groupAssignments).length
  const allTeams = [
    ...availableTeams,
    ...Object.values(groupAssignments).flat(),
  ]
  const totalTeams = allTeams.length
  const teamsPerGroup = numGroups > 0 ? Math.ceil(totalTeams / numGroups) : 0

  if (isLoading) {
    return (
      <div className="px-[5%] lg:px-[7%] xl:px-[10%] py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-[5%] lg:px-[7%] xl:px-[10%] py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/management/competitions' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('cup.editGroups.title')}</h1>
            <p className="text-muted-foreground">{competitionName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!hasPlayedMatches && allTeams.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSorteoOpen(true)}
            >
              <Dice5 className="mr-2 h-4 w-4" />
              {t('cup.sorteo.button')}
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || hasPlayedMatches || availableTeams.length > 0}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('cup.editGroups.saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('cup.editGroups.save')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info */}
      {hasPlayedMatches && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('cup.editGroups.hasPlayedMatches')}</AlertDescription>
        </Alert>
      )}

      {/* DnD Area */}
      {!hasPlayedMatches && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Available teams pool (only shown when some are unassigned) */}
          {availableTeams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('step2.availableTeams')}
                  <Badge variant="secondary">{availableTeams.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DroppableLeagueZone
                  id="available"
                  teams={availableTeams}
                  isEmpty={availableTeams.length === 0}
                  emptyMessage={t('step2.availableTeams')}
                  minTeams={0}
                />
              </CardContent>
            </Card>
          )}

          {/* Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(groupAssignments)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([groupName, teams]) => (
                <Card key={groupName}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      {t('cup.groupLabel', { letter: groupName })}
                      <Badge variant="secondary" className="ml-auto">
                        {teams.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DroppableLeagueZone
                      id={groupName}
                      teams={teams}
                      isEmpty={teams.length === 0}
                      emptyMessage={`Arrastra equipos al ${t('cup.groupLabel', { letter: groupName })}`}
                      minTeams={2}
                    />
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTeam ? <DraggableTeam team={activeTeam} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{numGroups} grupos</span>
        <span>{totalTeams} equipos totales</span>
        {availableTeams.length > 0 && (
          <Badge variant="destructive">{availableTeams.length} sin asignar</Badge>
        )}
      </div>

      {/* Sorteo Draw Modal */}
      {numGroups > 0 && teamsPerGroup > 0 && (
        <SorteoDrawModal
          open={sorteoOpen}
          onOpenChange={setSorteoOpen}
          teams={allTeams}
          numGroups={numGroups}
          teamsPerGroup={teamsPerGroup}
          onComplete={handleSorteoComplete}
        />
      )}
    </div>
  )
}
