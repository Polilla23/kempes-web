import { useState, useEffect, useMemo, useCallback } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Trophy, Medal, ArrowLeft, Users, ArrowRight, Zap } from 'lucide-react'
import { FixtureService, type KempesCupGroupsStatus, type KempesCupQualifiedTeams, type QualifiedTeam } from '@/services/fixture.service'
import CompetitionService from '@/services/competition.service'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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
 * Calcula info de bracket para stat tiles
 */
function calculateBracketInfo(teamCount: number) {
  if (teamCount < 2) return null
  let bracketSize = 2
  while (bracketSize < teamCount) bracketSize *= 2
  const byeCount = bracketSize - teamCount

  let firstRoundName = ''
  switch (bracketSize) {
    case 2: firstRoundName = 'Final'; break
    case 4: firstRoundName = 'Semifinales'; break
    case 8: firstRoundName = 'Cuartos'; break
    case 16: firstRoundName = 'Octavos'; break
    case 32: firstRoundName = '16vos'; break
    default: firstRoundName = `R${bracketSize}`
  }

  return { bracketSize, byeCount, firstRoundName }
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
        <Card className="bg-card border-border">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando datos de la Copa Kempes...</span>
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
        <Alert className="bg-green-500/10 border-green-500/30">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-500">Copas generadas exitosamente</AlertTitle>
          <AlertDescription className="text-green-400">
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
          key="gold-bracket"
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
            <Medal className="h-6 w-6 text-slate-400" />
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
          key="silver-bracket"
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
  const goldInfo = calculateBracketInfo(qualifiedTeams.goldTeams.length)
  const silverInfo = qualifiedTeams.silverTeams.length > 0 ? calculateBracketInfo(qualifiedTeams.silverTeams.length) : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* Page header */}
        <div>
          <Button variant="ghost" onClick={() => navigate({ to: '/fixtures' })} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Generar Copa de Oro y Plata</h1>
              <p className="text-muted-foreground">{groupsStatus.competitionName}</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Grupos - grid 2 cols */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {groupsStatus.groups.map((group) => (
            <Card key={group.groupName} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Grupo {group.groupName}
                  </CardTitle>
                  <Badge
                    variant={group.isComplete ? 'default' : 'secondary'}
                    className={group.isComplete ? 'bg-green-600' : ''}
                  >
                    {group.isComplete ? 'Completo' : `${group.matchesPlayed}/${group.matchesTotal}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {group.standings.map((team, idx) => {
                    const isGold = idx < groupsStatus.qualifyToGold
                    const isSilver = idx >= groupsStatus.qualifyToGold && idx < groupsStatus.qualifyToGold + groupsStatus.qualifyToSilver

                    return (
                      <div
                        key={team.clubId}
                        className={cn(
                          'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors',
                          isGold && 'bg-amber-500/10',
                          isSilver && 'bg-slate-400/10',
                          !isGold && !isSilver && 'opacity-50'
                        )}
                      >
                        {/* Position badge */}
                        {isGold ? (
                          <Badge className="bg-amber-600 dark:bg-amber-500 text-white text-[10px] px-1.5 py-0 min-w-[22px] justify-center">
                            {idx + 1}
                          </Badge>
                        ) : isSilver ? (
                          <Badge className="bg-slate-400 text-white text-[10px] px-1.5 py-0 min-w-[22px] justify-center">
                            {idx + 1}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 min-w-[22px] justify-center">
                            {idx + 1}
                          </Badge>
                        )}

                        {/* Club logo */}
                        <div className="w-6 h-6 rounded border overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                          {team.clubLogo ? (
                            <img src={team.clubLogo} alt={team.clubName} className="w-5 h-5 object-contain" />
                          ) : (
                            <span className="text-[8px] font-bold text-muted-foreground">
                              {team.clubName.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <span className="flex-1 truncate font-medium">{team.clubName}</span>

                        {/* Stats */}
                        <span className="text-xs text-muted-foreground tabular-nums">{team.played}PJ</span>
                        <span className="text-xs font-bold tabular-nums w-8 text-right">{team.points}</span>

                        {/* Zone icon */}
                        {isGold && <Trophy className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                        {isSilver && <Medal className="h-3 w-3 text-slate-400 flex-shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumen y acción */}
        {qualifiedTeams.isReady && (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              {/* Stat tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-foreground">{qualifiedTeams.goldTeams.length}</div>
                  <div className="text-xs text-muted-foreground">Copa de Oro</div>
                  {goldInfo && (
                    <div className="text-[10px] text-amber-500 mt-1">
                      Desde {goldInfo.firstRoundName}
                    </div>
                  )}
                </div>
                <div className="text-center p-4 bg-slate-400/10 rounded-lg border border-slate-400/20">
                  <Medal className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-foreground">{qualifiedTeams.silverTeams.length}</div>
                  <div className="text-xs text-muted-foreground">Copa de Plata</div>
                  {silverInfo && (
                    <div className="text-[10px] text-slate-400 mt-1">
                      Desde {silverInfo.firstRoundName}
                    </div>
                  )}
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Zap className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-foreground">{goldInfo?.byeCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">BYEs Oro</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Pasan directo</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Zap className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-foreground">{silverInfo?.byeCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">BYEs Plata</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Pasan directo</div>
                </div>
              </div>

              {/* Leyenda */}
              <div className="flex items-center justify-center gap-6 mb-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-500/30" />
                  <span>Primeros {groupsStatus.qualifyToGold} → Oro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-slate-400/30" />
                  <span>Siguientes {groupsStatus.qualifyToSilver} → Plata</span>
                </div>
              </div>

              {/* CTA */}
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
            </CardContent>
          </Card>
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
    </div>
  )
}

export default GenerateBracketsPage
