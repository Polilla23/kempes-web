import { useState, useEffect, useMemo, useCallback } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Trophy, Medal, ArrowLeft, Users, Info, ArrowRight } from 'lucide-react'
import { FixtureService, type KempesCupGroupsStatus, type KempesCupQualifiedTeams, type QualifiedTeam } from '@/services/fixture.service'
import CompetitionService from '@/services/competition.service'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BracketEditorContainer } from '../_components/bracket-editor/bracket-editor-container'
import { BomboTeamsPanel } from '../_components/bracket-editor/bombo-teams-panel'
import type { EmptyBracketStructure, BracketTeamPlacement, AvailableTeamWithGroup } from '@/types/bracket-editor'

type WizardStep = 'status' | 'gold-bracket' | 'silver-bracket' | 'success'

export const Route = createFileRoute('/management/fixtures/cup/kempes/generate-brackets')({
  component: GenerateBracketsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      competitionId: search.competitionId as string,
    }
  },
})

/**
 * Convierte QualifiedTeam[] a AvailableTeamWithGroup[] para el BomboTeamsPanel
 */
function toAvailableTeamsWithGroup(teams: QualifiedTeam[]): AvailableTeamWithGroup[] {
  return teams.map((t) => ({
    id: t.clubId,
    name: t.clubName,
    logo: t.clubLogo || null,
    isAssigned: false,
    groupName: t.groupName,
    position: t.position,
  }))
}

/**
 * Valida que no haya equipos del mismo grupo enfrentandose en primera ronda.
 * Retorna un mensaje de warning si hay cruces, o null si todo OK.
 */
function validateSameGroupConstraint(
  placements: BracketTeamPlacement[],
  teams: AvailableTeamWithGroup[],
  structure: EmptyBracketStructure
): string | null {
  const byePositions = new Set(structure.byePositions)
  const firstRound = structure.firstRound
  const matchCount = structure.rounds[0]?.matchCount || 0
  const warnings: string[] = []

  for (let pos = 1; pos <= matchCount; pos++) {
    if (byePositions.has(pos)) continue

    const homeSlotId = `${firstRound}_${pos}_home`
    const awaySlotId = `${firstRound}_${pos}_away`

    const homePlacement = placements.find((p) => p.slotId === homeSlotId)
    const awayPlacement = placements.find((p) => p.slotId === awaySlotId)

    if (homePlacement && awayPlacement) {
      const homeTeam = teams.find((t) => t.id === homePlacement.teamId)
      const awayTeam = teams.find((t) => t.id === awayPlacement.teamId)

      if (homeTeam && awayTeam && homeTeam.groupName === awayTeam.groupName) {
        warnings.push(
          `${homeTeam.name} y ${awayTeam.name} son del mismo grupo (${homeTeam.groupName})`
        )
      }
    }
  }

  return warnings.length > 0
    ? `Equipos del mismo grupo enfrentandose: ${warnings.join('; ')}`
    : null
}

/**
 * Componente que muestra un resumen de la estructura del bracket
 */
function BracketSummary({ goldTeamCount, silverTeamCount }: { goldTeamCount: number; silverTeamCount: number }) {
  const calculateBracketInfo = (teamCount: number) => {
    if (teamCount < 2) return null
    let bracketSize = 2
    while (bracketSize < teamCount) bracketSize *= 2
    const byeCount = bracketSize - teamCount
    const matchesInFirstRound = bracketSize / 2

    let firstRoundName = ''
    switch (bracketSize) {
      case 2: firstRoundName = 'Final'; break
      case 4: firstRoundName = 'Semifinales'; break
      case 8: firstRoundName = 'Cuartos de Final'; break
      case 16: firstRoundName = 'Octavos de Final'; break
      case 32: firstRoundName = 'Dieciseisavos'; break
      default: firstRoundName = `Ronda de ${bracketSize}`
    }

    return { bracketSize, byeCount, matchesInFirstRound, firstRoundName, teamsWithBye: byeCount, teamsPlaying: teamCount - byeCount }
  }

  const goldInfo = calculateBracketInfo(goldTeamCount)
  const silverInfo = silverTeamCount > 0 ? calculateBracketInfo(silverTeamCount) : null

  if (!goldInfo) return null

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <Card className="border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
            <Info className="h-4 w-4" />
            Estructura Copa de Oro
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><strong>Equipos:</strong> {goldTeamCount}</p>
          <p><strong>Bracket:</strong> {goldInfo.bracketSize} posiciones</p>
          <p><strong>Primera ronda:</strong> {goldInfo.firstRoundName}</p>
          {goldInfo.byeCount > 0 ? (
            <p className="text-amber-600">
              <strong>Byes:</strong> {goldInfo.byeCount} equipos pasan directo
            </p>
          ) : (
            <p className="text-green-600"><strong>Sin byes</strong></p>
          )}
        </CardContent>
      </Card>

      {silverInfo && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
              <Info className="h-4 w-4" />
              Estructura Copa de Plata
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>Equipos:</strong> {silverTeamCount}</p>
            <p><strong>Bracket:</strong> {silverInfo.bracketSize} posiciones</p>
            <p><strong>Primera ronda:</strong> {silverInfo.firstRoundName}</p>
            {silverInfo.byeCount > 0 ? (
              <p className="text-slate-600">
                <strong>Byes:</strong> {silverInfo.byeCount} equipos pasan directo
              </p>
            ) : (
              <p className="text-green-600"><strong>Sin byes</strong></p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GenerateBracketsPage() {
  const navigate = useNavigate()
  const { competitionId } = useSearch({ from: '/management/fixtures/cup/kempes/generate-brackets' })

  // Data loading state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groupsStatus, setGroupsStatus] = useState<KempesCupGroupsStatus | null>(null)
  const [qualifiedTeams, setQualifiedTeams] = useState<KempesCupQualifiedTeams | null>(null)

  // Wizard state
  const [step, setStep] = useState<WizardStep>('status')
  const [generating, setGenerating] = useState(false)

  // Bracket structures
  const [goldBracketStructure, setGoldBracketStructure] = useState<EmptyBracketStructure | null>(null)
  const [silverBracketStructure, setSilverBracketStructure] = useState<EmptyBracketStructure | null>(null)

  // Placements
  const [goldPlacements, setGoldPlacements] = useState<BracketTeamPlacement[] | null>(null)
  const [silverPlacements, setSilverPlacements] = useState<BracketTeamPlacement[] | null>(null)

  // Warning for same-group constraint
  const [goldWarning, setGoldWarning] = useState<string | null>(null)

  // Generated cup IDs
  const [generatedCups, setGeneratedCups] = useState<{ goldCupId?: string; silverCupId?: string } | null>(null)

  // Teams for bracket editor
  const goldTeamsForEditor = useMemo(() => {
    if (!qualifiedTeams) return []
    return toAvailableTeamsWithGroup(qualifiedTeams.goldTeams)
  }, [qualifiedTeams])

  const silverTeamsForEditor = useMemo(() => {
    if (!qualifiedTeams) return []
    return toAvailableTeamsWithGroup(qualifiedTeams.silverTeams)
  }, [qualifiedTeams])

  useEffect(() => {
    if (competitionId) loadData()
  }, [competitionId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [status, qualified] = await Promise.all([
        FixtureService.getKempesCupGroupsStatus(competitionId),
        FixtureService.getKempesCupQualifiedTeams(competitionId),
      ])
      setGroupsStatus(status)
      setQualifiedTeams(qualified)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueToBracket = async () => {
    if (!qualifiedTeams) return
    try {
      setError(null)
      setGenerating(true)

      // Fetch bracket structures
      const goldStructure = await CompetitionService.getBracketStructure(qualifiedTeams.goldTeams.length)
      setGoldBracketStructure(goldStructure)

      if (qualifiedTeams.silverTeams.length > 0) {
        const silverStructure = await CompetitionService.getBracketStructure(qualifiedTeams.silverTeams.length)
        setSilverBracketStructure(silverStructure)
      }

      setStep('gold-bracket')
    } catch (err) {
      console.error('Error fetching bracket structure:', err)
      setError(err instanceof Error ? err.message : 'Error al obtener la estructura del bracket')
    } finally {
      setGenerating(false)
    }
  }

  const handleGoldConfirm = useCallback((placements: BracketTeamPlacement[]) => {
    setGoldPlacements(placements)

    // Validate same-group constraint
    if (goldBracketStructure) {
      const warning = validateSameGroupConstraint(placements, goldTeamsForEditor, goldBracketStructure)
      setGoldWarning(warning)
    }

    // Move to silver bracket or generate
    if (qualifiedTeams && qualifiedTeams.silverTeams.length > 0 && silverBracketStructure) {
      setStep('silver-bracket')
    } else {
      // No silver teams, generate directly
      handleFinalGenerate(placements, [])
    }
  }, [goldBracketStructure, goldTeamsForEditor, qualifiedTeams, silverBracketStructure])

  const handleSilverConfirm = useCallback((placements: BracketTeamPlacement[]) => {
    setSilverPlacements(placements)
    handleFinalGenerate(goldPlacements!, placements)
  }, [goldPlacements])

  const handleFinalGenerate = async (
    goldPlc: BracketTeamPlacement[],
    silverPlc: BracketTeamPlacement[]
  ) => {
    try {
      setGenerating(true)
      setError(null)

      const result = await FixtureService.generateGoldSilverCups({
        kempesCupId: competitionId,
        goldTeamPlacements: goldPlc,
        silverTeamPlacements: silverPlc,
      })

      setGeneratedCups({
        goldCupId: result.goldCup.id,
        silverCupId: result.silverCup?.id,
      })
      setStep('success')
    } catch (err) {
      console.error('Error generating brackets:', err)
      setError(err instanceof Error ? err.message : 'Error al generar los brackets')
      // Go back to gold bracket step on error
      setStep('gold-bracket')
    } finally {
      setGenerating(false)
    }
  }

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando datos de la Copa Kempes...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!groupsStatus || !qualifiedTeams) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'No se pudieron cargar los datos de la Copa Kempes'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // ---- SUCCESS STEP ----
  if (step === 'success' && generatedCups) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Copas generadas exitosamente</AlertTitle>
          <AlertDescription className="text-green-700">
            Se han creado la Copa de Oro y la Copa de Plata con los equipos clasificados.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate({ to: '/fixtures' })}>Ver Fixtures</Button>
          <Button variant="outline" onClick={() => navigate({ to: '/management/fixtures/cup' })}>
            Volver a Copas
          </Button>
        </div>
      </div>
    )
  }

  // ---- GOLD BRACKET STEP ----
  if (step === 'gold-bracket' && goldBracketStructure) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setStep('status')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al resumen
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Copa de Oro - Armar Bracket
          </h1>
          <p className="text-muted-foreground mt-1">
            Asigna los equipos clasificados a las posiciones del bracket
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <BracketEditorContainer
          structure={goldBracketStructure}
          teams={goldTeamsForEditor}
          onConfirm={handleGoldConfirm}
          onCancel={() => setStep('status')}
          isSubmitting={generating}
          confirmLabel={qualifiedTeams.silverTeams.length > 0 ? 'Continuar a Copa de Plata' : 'Generar Copas'}
          renderTeamsPanel={(props) => (
            <BomboTeamsPanel
              teams={goldTeamsForEditor.map(t => ({
                ...t,
                isAssigned: props.teams.find(pt => pt.id === t.id)?.isAssigned || false,
              }))}
              assignedCount={props.assignedCount}
              totalRequired={props.totalRequired}
              selectedTeamId={props.selectedTeamId}
              onSelectTeam={props.onSelectTeam}
            />
          )}
        />
      </div>
    )
  }

  // ---- SILVER BRACKET STEP ----
  if (step === 'silver-bracket' && silverBracketStructure) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setStep('gold-bracket')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Copa de Oro
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Medal className="h-6 w-6 text-slate-500" />
            Copa de Plata - Armar Bracket
          </h1>
          <p className="text-muted-foreground mt-1">
            Asigna los equipos clasificados a las posiciones del bracket
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <BracketEditorContainer
          structure={silverBracketStructure}
          teams={silverTeamsForEditor}
          onConfirm={handleSilverConfirm}
          onCancel={() => setStep('gold-bracket')}
          isSubmitting={generating}
          confirmLabel="Generar Copas"
          renderTeamsPanel={(props) => (
            <BomboTeamsPanel
              teams={silverTeamsForEditor.map(t => ({
                ...t,
                isAssigned: props.teams.find(pt => pt.id === t.id)?.isAssigned || false,
              }))}
              assignedCount={props.assignedCount}
              totalRequired={props.totalRequired}
              selectedTeamId={props.selectedTeamId}
              onSelectTeam={props.onSelectTeam}
            />
          )}
        />
      </div>
    )
  }

  // ---- STATUS STEP (default) ----
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate({ to: '/fixtures' })} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold mb-2">Generar Copa de Oro y Copa de Plata</h1>
        <p className="text-muted-foreground">{groupsStatus.competitionName}</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estado de los grupos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estado de los Grupos
          </CardTitle>
          <CardDescription>
            {groupsStatus.allGroupsComplete
              ? 'Todos los grupos han finalizado. Puedes armar los brackets.'
              : 'Algunos grupos aun no han terminado.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {groupsStatus.groups.map((group) => (
              <div key={group.groupName} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Grupo {group.groupName}</span>
                  <Badge variant={group.isComplete ? 'default' : 'secondary'}>
                    {group.isComplete ? 'Completo' : `${group.matchesPlayed}/${group.matchesTotal}`}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {group.standings.slice(0, 3).map((team, idx) => (
                    <div key={team.clubId} className="flex items-center gap-1">
                      <span className="w-4">{idx + 1}.</span>
                      <span className="truncate">{team.clubName}</span>
                      <span className="ml-auto">{team.points}pts</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipos clasificados */}
      {qualifiedTeams.isReady && (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Copa de Oro */}
            <Card>
              <CardHeader className="bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Trophy className="h-5 w-5" />
                  Copa de Oro ({qualifiedTeams.goldTeams.length} equipos)
                </CardTitle>
                <CardDescription>
                  Primeros {groupsStatus.qualifyToGold} de cada grupo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {qualifiedTeams.goldTeams.map((team) => (
                    <div key={team.clubId} className="flex items-center gap-2 p-2 bg-muted rounded">
                      {team.clubLogo && (
                        <img src={team.clubLogo} alt={team.clubName} className="h-6 w-6 object-contain" />
                      )}
                      <span className="flex-1">{team.clubName}</span>
                      <Badge variant="outline">
                        {team.position}° Grupo {team.groupName}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Copa de Plata */}
            {qualifiedTeams.silverTeams.length > 0 && (
              <Card>
                <CardHeader className="bg-slate-50">
                  <CardTitle className="flex items-center gap-2 text-slate-700">
                    <Medal className="h-5 w-5" />
                    Copa de Plata ({qualifiedTeams.silverTeams.length} equipos)
                  </CardTitle>
                  <CardDescription>
                    Siguientes {groupsStatus.qualifyToSilver} de cada grupo
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {qualifiedTeams.silverTeams.map((team) => (
                      <div key={team.clubId} className="flex items-center gap-2 p-2 bg-muted rounded">
                        {team.clubLogo && (
                          <img src={team.clubLogo} alt={team.clubName} className="h-6 w-6 object-contain" />
                        )}
                        <span className="flex-1">{team.clubName}</span>
                        <Badge variant="outline">
                          {team.position}° Grupo {team.groupName}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator className="my-6" />

          {/* Resumen del bracket */}
          <BracketSummary
            goldTeamCount={qualifiedTeams.goldTeams.length}
            silverTeamCount={qualifiedTeams.silverTeams.length}
          />

          {/* Boton para continuar al bracket editor */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleContinueToBracket}
              disabled={generating || !groupsStatus.allGroupsComplete}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continuar al Bracket
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {!qualifiedTeams.isReady && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Grupos incompletos</AlertTitle>
          <AlertDescription>
            Debes esperar a que todos los partidos de fase de grupos esten finalizados para poder generar los brackets
            de Copa de Oro y Copa de Plata.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default GenerateBracketsPage
