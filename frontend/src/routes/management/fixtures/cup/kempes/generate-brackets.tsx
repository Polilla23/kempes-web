import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Trophy, Medal, ArrowLeft, Users, Info } from 'lucide-react'
import { FixtureService, type KempesCupGroupsStatus, type KempesCupQualifiedTeams, type BracketInput, type QualifiedTeam } from '@/services/fixture.service'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

/**
 * Componente que muestra un resumen de como quedara el bracket
 */
function BracketSummary({ goldTeamCount, silverTeamCount }: { goldTeamCount: number; silverTeamCount: number }) {
  const calculateBracketInfo = (teamCount: number) => {
    if (teamCount < 2) return null

    // Calcular tamano del bracket (potencia de 2)
    let bracketSize = 2
    while (bracketSize < teamCount) {
      bracketSize *= 2
    }

    const byeCount = bracketSize - teamCount
    const matchesInFirstRound = bracketSize / 2
    const actualFirstRoundMatches = matchesInFirstRound - byeCount

    // Determinar nombre de la primera ronda
    let firstRoundName = ''
    switch (bracketSize) {
      case 2:
        firstRoundName = 'Final'
        break
      case 4:
        firstRoundName = 'Semifinales'
        break
      case 8:
        firstRoundName = 'Cuartos de Final'
        break
      case 16:
        firstRoundName = 'Octavos de Final'
        break
      case 32:
        firstRoundName = 'Dieciseisavos'
        break
      default:
        firstRoundName = `Ronda de ${bracketSize}`
    }

    return {
      bracketSize,
      byeCount,
      matchesInFirstRound,
      actualFirstRoundMatches,
      firstRoundName,
      teamsWithBye: byeCount,
      teamsPlaying: teamCount - byeCount,
    }
  }

  const goldInfo = calculateBracketInfo(goldTeamCount)
  const silverInfo = silverTeamCount > 0 ? calculateBracketInfo(silverTeamCount) : null

  if (!goldInfo) return null

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      {/* Copa de Oro */}
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
            <>
              <p className="text-amber-600">
                <strong>Byes:</strong> {goldInfo.byeCount} equipos pasan directo
              </p>
              <p className="text-muted-foreground text-xs">
                Los {goldInfo.byeCount} mejor posicionados avanzan sin jugar la primera ronda
              </p>
            </>
          ) : (
            <p className="text-green-600">
              <strong>Sin byes:</strong> Todos juegan desde {goldInfo.firstRoundName}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Copa de Plata */}
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
              <>
                <p className="text-slate-600">
                  <strong>Byes:</strong> {silverInfo.byeCount} equipos pasan directo
                </p>
                <p className="text-muted-foreground text-xs">
                  Los {silverInfo.byeCount} mejor posicionados avanzan sin jugar la primera ronda
                </p>
              </>
            ) : (
              <p className="text-green-600">
                <strong>Sin byes:</strong> Todos juegan desde {silverInfo.firstRoundName}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const Route = createFileRoute('/management/fixtures/cup/kempes/generate-brackets')({
  component: GenerateBracketsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      competitionId: search.competitionId as string,
    }
  },
})

function GenerateBracketsPage() {
  const navigate = useNavigate()
  const { competitionId } = useSearch({ from: '/management/fixtures/cup/kempes/generate-brackets' })

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [groupsStatus, setGroupsStatus] = useState<KempesCupGroupsStatus | null>(null)
  const [qualifiedTeams, setQualifiedTeams] = useState<KempesCupQualifiedTeams | null>(null)
  const [generatedCups, setGeneratedCups] = useState<{ goldCupId?: string; silverCupId?: string } | null>(null)

  useEffect(() => {
    if (competitionId) {
      loadData()
    }
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

  /**
   * Genera los brackets para Copa Oro y Copa Plata
   * Los byes se colocan en posiciones estrategicas (2 arriba, 2 abajo del bracket)
   */
  const handleGenerate = async () => {
    if (!qualifiedTeams || !groupsStatus) return

    try {
      setGenerating(true)
      setError(null)

      const goldTeams = qualifiedTeams.goldTeams
      const silverTeams = qualifiedTeams.silverTeams

      // Generar brackets con byes balanceados
      const goldBrackets = generateBracketsWithByes(goldTeams.length)
      const silverBrackets = silverTeams.length > 0 ? generateBracketsWithByes(silverTeams.length) : []

      // Asignar equipos a los brackets
      // Los 1ros de grupo van a las posiciones con bye (pasan directo)
      // Los demas se asignan al resto de las posiciones
      assignTeamsToBrackets(goldBrackets, goldTeams)
      assignTeamsToBrackets(silverBrackets, silverTeams)

      const result = await FixtureService.generateGoldSilverCups({
        kempesCupId: competitionId,
        goldBrackets,
        silverBrackets,
      })

      setGeneratedCups({
        goldCupId: result.goldCup.id,
        silverCupId: result.silverCup?.id,
      })
      setSuccess(true)
    } catch (err) {
      console.error('Error generating brackets:', err)
      setError(err instanceof Error ? err.message : 'Error al generar los brackets')
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Genera estructura de brackets FLEXIBLE basada en la cantidad de equipos
   *
   * Ejemplos:
   * - 8 equipos → Bracket de 8 → Cuartos directos (4 partidos, 0 byes)
   * - 12 equipos → Bracket de 16 → 8vos con 4 byes
   * - 16 equipos → Bracket de 16 → 8vos completos (0 byes)
   * - 6 equipos → Bracket de 8 → Cuartos con 2 byes
   * - 4 equipos → Bracket de 4 → Semifinales directas (0 byes)
   *
   * Los byes se distribuyen equilibradamente: mitad arriba, mitad abajo del bracket
   */
  const generateBracketsWithByes = (teamCount: number): BracketInput[] => {
    const brackets: BracketInput[] = []

    // Caso especial: menos de 2 equipos no tiene sentido
    if (teamCount < 2) {
      console.warn('Se necesitan al menos 2 equipos para generar un bracket')
      return brackets
    }

    // Calcular tamano del bracket (potencia de 2 mas cercana hacia arriba)
    let bracketSize = 2
    while (bracketSize < teamCount) {
      bracketSize *= 2
    }

    const byeCount = bracketSize - teamCount
    const matchesInFirstRound = bracketSize / 2

    // Calcular total de rondas
    // 2 equipos = 1 ronda (final)
    // 4 equipos = 2 rondas (semi + final)
    // 8 equipos = 3 rondas (cuartos + semi + final)
    // 16 equipos = 4 rondas (8vos + cuartos + semi + final)
    let totalRounds = 1
    let temp = bracketSize
    while (temp > 2) {
      temp /= 2
      totalRounds++
    }

    // Calcular posiciones de bye distribuidas equilibradamente
    // Mitad de byes arriba del bracket, mitad abajo
    const byePositions = new Set<number>()
    const byesTop = Math.ceil(byeCount / 2)
    const byesBottom = Math.floor(byeCount / 2)

    // Byes en la parte superior (posiciones 1, 2, 3...)
    for (let i = 1; i <= byesTop; i++) {
      byePositions.add(i)
    }

    // Byes en la parte inferior (posiciones n, n-1, n-2...)
    for (let i = 0; i < byesBottom; i++) {
      byePositions.add(matchesInFirstRound - i)
    }

    // Primera ronda
    for (let i = 1; i <= matchesInFirstRound; i++) {
      brackets.push({
        round: 1,
        position: i,
        isBye: byePositions.has(i),
      })
    }

    // Rondas siguientes (sin equipos asignados, solo placeholders)
    let matchesInRound = matchesInFirstRound / 2
    for (let round = 2; round <= totalRounds; round++) {
      for (let pos = 1; pos <= matchesInRound; pos++) {
        brackets.push({
          round,
          position: pos,
        })
      }
      matchesInRound = Math.max(1, matchesInRound / 2)
    }

    return brackets
  }

  /**
   * Asigna equipos a los brackets de forma inteligente
   * - Los equipos mejor posicionados (1ros de grupo) reciben byes si los hay
   * - Los demas se distribuyen en los partidos normales
   * - Se mezclan los grupos para evitar que equipos del mismo grupo se enfrenten temprano
   */
  const assignTeamsToBrackets = (brackets: BracketInput[], teams: QualifiedTeam[]) => {
    if (!teams || teams.length === 0) return

    const firstRoundBrackets = brackets.filter((b) => b.round === 1)
    const byeBrackets = firstRoundBrackets.filter((b) => b.isBye)
    const normalBrackets = firstRoundBrackets.filter((b) => !b.isBye)

    // Ordenar equipos por posicion en grupo (1ros primero, luego 2dos, etc.)
    const sortedTeams = [...teams].sort((a, b) => a.position - b.position)

    // Los equipos mejor posicionados reciben byes (pasan directo a siguiente ronda)
    const teamsWithByes = sortedTeams.slice(0, byeBrackets.length)
    const teamsToPlay = sortedTeams.slice(byeBrackets.length)

    // Asignar equipos con bye
    byeBrackets.forEach((bracket, index) => {
      if (teamsWithByes[index]) {
        bracket.homeTeamId = teamsWithByes[index].clubId
        bracket.awayTeamId = undefined // Bye - no hay rival
      }
    })

    // Asignar equipos que juegan partidos normales
    // Mezclar para que equipos del mismo grupo no se enfrenten en primera ronda
    const shuffledTeamsToPlay = shuffleAvoidingSameGroup(teamsToPlay)

    let teamIndex = 0
    normalBrackets.forEach((bracket) => {
      if (shuffledTeamsToPlay[teamIndex]) {
        bracket.homeTeamId = shuffledTeamsToPlay[teamIndex].clubId
        teamIndex++
      }
      if (shuffledTeamsToPlay[teamIndex]) {
        bracket.awayTeamId = shuffledTeamsToPlay[teamIndex].clubId
        teamIndex++
      }
    })
  }

  /**
   * Mezcla equipos intentando evitar que equipos del mismo grupo se enfrenten
   */
  const shuffleAvoidingSameGroup = (teams: QualifiedTeam[]): QualifiedTeam[] => {
    if (teams.length <= 2) return teams

    // Agrupar por grupo de origen
    const teamsByGroup = new Map<string, QualifiedTeam[]>()
    teams.forEach((team) => {
      if (!teamsByGroup.has(team.groupName)) {
        teamsByGroup.set(team.groupName, [])
      }
      teamsByGroup.get(team.groupName)!.push(team)
    })

    // Intercalar equipos de diferentes grupos
    const result: QualifiedTeam[] = []
    const groups = Array.from(teamsByGroup.values())
    const maxLength = Math.max(...groups.map((g) => g.length))

    for (let i = 0; i < maxLength; i++) {
      for (const group of groups) {
        if (group[i]) {
          result.push(group[i])
        }
      }
    }

    return result
  }

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

  if (success && generatedCups) {
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

  if (!groupsStatus || !qualifiedTeams) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudieron cargar los datos de la Copa Kempes</AlertDescription>
        </Alert>
      </div>
    )
  }

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
              ? 'Todos los grupos han finalizado. Puedes generar los brackets.'
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
          </div>

          <Separator className="my-6" />

          {/* Resumen del bracket */}
          <BracketSummary
            goldTeamCount={qualifiedTeams.goldTeams.length}
            silverTeamCount={qualifiedTeams.silverTeams.length}
          />

          {/* Boton de generar */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={generating || !groupsStatus.allGroupsComplete}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  Generar Copa de Oro y Copa de Plata
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
