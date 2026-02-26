import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dice5, Play, Zap, RotateCcw, Check, Info, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AvailableTeam, GroupAssignment } from '@/types/fixture'
import { FixtureService, type CoefKempesRankingEntry } from '@/services/fixture.service'
import { SorteoBombo } from './sorteo-bombo'
import { SorteoGroupSlot } from './sorteo-group-slot'
import { SorteoRevealedTeam } from './sorteo-revealed-team'
import { cn } from '@/lib/utils'

interface SorteoDrawModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teams: AvailableTeam[]
  numGroups: number
  teamsPerGroup: number
  onComplete: (assignments: GroupAssignment) => void
}

type DrawPhase = 'setup' | 'idle' | 'shaking' | 'revealed' | 'complete'

export function SorteoDrawModal({
  open,
  onOpenChange,
  teams,
  numGroups,
  teamsPerGroup,
  onComplete,
}: SorteoDrawModalProps) {
  const { t } = useTranslation('fixtures')

  // Core state
  const [phase, setPhase] = useState<DrawPhase>('setup')
  const [pots, setPots] = useState<AvailableTeam[][]>([])
  const [activePotIndex, setActivePotIndex] = useState(0)
  const [revealedTeam, setRevealedTeam] = useState<AvailableTeam | null>(null)
  const [groupAssignments, setGroupAssignments] = useState<GroupAssignment>({})
  const [potTracker, setPotTracker] = useState<Record<string, number[]>>({})
  const [isLoadingRanking, setIsLoadingRanking] = useState(false)
  const [rankingData, setRankingData] = useState<CoefKempesRankingEntry[] | null>(null)
  const [noCoefData, setNoCoefData] = useState(false)
  const autoPlayRef = useRef(false)
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset all state
  const resetState = useCallback(() => {
    setPhase('setup')
    setActivePotIndex(0)
    setRevealedTeam(null)
    autoPlayRef.current = false
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)

    const groups: GroupAssignment = {}
    const tracker: Record<string, number[]> = {}
    for (let i = 0; i < numGroups; i++) {
      const groupId = String.fromCharCode(65 + i)
      groups[groupId] = []
      tracker[groupId] = []
    }
    setGroupAssignments(groups)
    setPotTracker(tracker)
  }, [numGroups])

  // Distribute teams into pots based on ranking
  const distributePots = useCallback(
    (ranking: CoefKempesRankingEntry[] | null) => {
      let sortedTeams: AvailableTeam[]

      if (ranking && ranking.length > 0) {
        const rankMap = new Map<string, number>()
        ranking.forEach((r) => rankMap.set(r.clubId, r.totalPoints))

        sortedTeams = [...teams].sort((a, b) => {
          const pa = rankMap.get(a.id) || 0
          const pb = rankMap.get(b.id) || 0
          if (pb !== pa) return pb - pa
          return a.name.localeCompare(b.name)
        })
        setNoCoefData(false)
      } else {
        sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name))
        setNoCoefData(true)
      }

      // N pots where N = teamsPerGroup
      // First numGroups teams → pot 0 (seeds), next numGroups → pot 1, etc.
      const numPots = teamsPerGroup
      const newPots: AvailableTeam[][] = Array.from({ length: numPots }, () => [])

      sortedTeams.forEach((team, idx) => {
        const potIdx = Math.floor(idx / numGroups)
        if (potIdx < numPots) {
          newPots[potIdx].push(team)
        }
      })

      setPots(newPots)
    },
    [teams, numGroups, teamsPerGroup]
  )

  // Load ranking and distribute on open
  useEffect(() => {
    if (!open || teams.length === 0) return
    resetState()

    const load = async () => {
      setIsLoadingRanking(true)
      try {
        const ranking = await FixtureService.getCoefKempesRanking()
        setRankingData(ranking)
        distributePots(ranking)
      } catch {
        setNoCoefData(true)
        setRankingData(null)
        distributePots(null)
      } finally {
        setIsLoadingRanking(false)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Draw a random team from the active pot
  const drawFromPot = useCallback(() => {
    const pot = pots[activePotIndex]
    if (!pot || pot.length === 0) return

    setPhase('shaking')

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * pot.length)
      const team = pot[randomIndex]

      // Remove from pot
      setPots((prev) =>
        prev.map((p, i) => (i === activePotIndex ? p.filter((_, j) => j !== randomIndex) : p))
      )

      setRevealedTeam(team)
      setPhase('revealed')
    }, 600)
  }, [pots, activePotIndex])

  // Get groups available for placement (respect pot-per-group rule)
  const getAvailableGroups = useCallback((): string[] => {
    return Object.keys(groupAssignments).filter((groupId) => {
      if (groupAssignments[groupId].length >= teamsPerGroup) return false
      if (potTracker[groupId]?.includes(activePotIndex)) return false
      return true
    })
  }, [groupAssignments, potTracker, activePotIndex, teamsPerGroup])

  // Place revealed team into a group
  const placeInGroup = useCallback(
    (groupId: string) => {
      if (!revealedTeam) return

      setGroupAssignments((prev) => ({
        ...prev,
        [groupId]: [...prev[groupId], { ...revealedTeam, isAssigned: true }],
      }))

      setPotTracker((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), activePotIndex],
      }))

      setRevealedTeam(null)

      // Check if all pots are empty
      const allEmpty = pots.every((pot) => pot.length === 0)

      if (allEmpty) {
        setPhase('complete')
        autoPlayRef.current = false
      } else {
        // If current pot is empty, advance to next pot with teams
        if (pots[activePotIndex].length === 0) {
          const next = pots.findIndex((pot, idx) => idx > activePotIndex && pot.length > 0)
          if (next !== -1) {
            setActivePotIndex(next)
          } else {
            // Fallback: check earlier pots
            const any = pots.findIndex((pot) => pot.length > 0)
            if (any !== -1) setActivePotIndex(any)
          }
        }
        setPhase('idle')
      }
    },
    [revealedTeam, pots, activePotIndex]
  )

  // Auto-place: group with fewest teams among available
  const autoPlace = useCallback(() => {
    const available = getAvailableGroups()
    if (available.length === 0) return

    const sorted = [...available].sort(
      (a, b) => groupAssignments[a].length - groupAssignments[b].length
    )

    // Among equal, pick random
    const minCount = groupAssignments[sorted[0]].length
    const candidates = sorted.filter((g) => groupAssignments[g].length === minCount)
    const chosen = candidates[Math.floor(Math.random() * candidates.length)]

    placeInGroup(chosen)
  }, [getAvailableGroups, groupAssignments, placeInGroup])

  // Auto-play scheduling effect
  useEffect(() => {
    if (!autoPlayRef.current) return

    if (phase === 'idle') {
      autoPlayTimerRef.current = setTimeout(drawFromPot, 800)
    } else if (phase === 'revealed') {
      autoPlayTimerRef.current = setTimeout(autoPlace, 1200)
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
    }
  }, [phase, drawFromPot, autoPlace])

  // Handlers
  const handleStartDraw = () => setPhase('idle')

  const startAutoDraw = () => {
    autoPlayRef.current = true
    setPhase('idle')
  }

  const handleRepeat = () => {
    autoPlayRef.current = false
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
    resetState()
    if (rankingData) {
      distributePots(rankingData)
    } else {
      distributePots(null)
    }
  }

  const handleConfirm = () => {
    onComplete(groupAssignments)
    onOpenChange(false)
  }

  // Computed values
  const availableGroups = getAvailableGroups()
  const totalPlaced = Object.values(groupAssignments).reduce(
    (sum, g) => sum + g.length,
    0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Animation keyframes */}
        <style>{`
          @keyframes sorteoShake {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            20% { transform: translateX(-2px) rotate(-1deg); }
            40% { transform: translateX(2px) rotate(1deg); }
            60% { transform: translateX(-1px) rotate(-0.5deg); }
            80% { transform: translateX(1px) rotate(0.5deg); }
          }
          .sorteo-shake {
            animation: sorteoShake 0.15s ease-in-out infinite;
          }
          @keyframes sorteoFadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .sorteo-fade-in {
            animation: sorteoFadeIn 0.3s ease-in;
          }
        `}</style>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dice5 className="h-5 w-5" />
            {t('cup.sorteo.title')}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {t('cup.sorteo.ruleOnePerPot')}
            <Badge variant="secondary" className="ml-1">
              {totalPlaced}/{teams.length}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {/* No CoefKempes data warning */}
        {noCoefData && phase === 'setup' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{t('cup.sorteo.noCoefData')}</AlertDescription>
          </Alert>
        )}

        {isLoadingRanking ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Dice5 className="h-8 w-8 animate-spin mr-2" />
            {t('wizard.buttons.loading')}
          </div>
        ) : (
          <div className="space-y-4">
            {/* === Pots Section === */}
            <div>
              <h3 className="text-sm font-medium mb-2">{t('cup.sorteo.bombos')}</h3>
              <div
                className={cn('grid gap-2', {
                  'grid-cols-2': pots.length <= 2,
                  'grid-cols-3': pots.length === 3,
                  'grid-cols-4': pots.length >= 4,
                })}
              >
                {pots.map((pot, idx) => (
                  <SorteoBombo
                    key={idx}
                    potIndex={idx}
                    teams={pot}
                    isActive={
                      idx === activePotIndex && phase !== 'setup' && phase !== 'complete'
                    }
                    isEmpty={pot.length === 0}
                    isDrawing={idx === activePotIndex && phase === 'shaking'}
                    onClick={
                      idx === activePotIndex && phase === 'idle' ? drawFromPot : undefined
                    }
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* === Center Area: Phase-specific content === */}
            {phase === 'setup' && (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-muted-foreground">
                  {t('cup.sorteo.setup')}
                </p>
              </div>
            )}

            {phase === 'shaking' && (
              <div className="flex items-center justify-center py-6">
                <Dice5 className="h-10 w-10 text-primary animate-bounce" />
                <span className="ml-3 text-muted-foreground">
                  {t('cup.sorteo.drawing')}
                </span>
              </div>
            )}

            {phase === 'revealed' && revealedTeam && (
              <div className="flex flex-col items-center py-4 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t('cup.sorteo.revealed')}
                </p>
                <SorteoRevealedTeam team={revealedTeam} isVisible />
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm text-muted-foreground">
                    {t('cup.sorteo.selectGroup')}
                  </p>
                  <Button size="sm" variant="outline" onClick={autoPlace}>
                    <Sparkles className="mr-1 h-3 w-3" />
                    {t('cup.sorteo.placeAuto')}
                  </Button>
                </div>
              </div>
            )}

            {phase === 'idle' && (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-muted-foreground">
                  {autoPlayRef.current
                    ? t('cup.sorteo.autoPlacing')
                    : `${t('cup.sorteo.draw')} — ${t('cup.sorteo.bombo', { number: activePotIndex + 1 })}`}
                </p>
              </div>
            )}

            {phase === 'complete' && (
              <div className="flex flex-col items-center py-6 space-y-2">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="font-semibold text-lg">{t('cup.sorteo.complete')}</p>
              </div>
            )}

            {/* === Groups Section === */}
            <div>
              <div
                className={cn('grid gap-2', {
                  'grid-cols-2': numGroups <= 2,
                  'grid-cols-3': numGroups === 3,
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-4': numGroups >= 4 && numGroups <= 6,
                  'grid-cols-2 md:grid-cols-4': numGroups > 6,
                })}
              >
                {Object.keys(groupAssignments)
                  .sort()
                  .map((groupId) => (
                    <SorteoGroupSlot
                      key={groupId}
                      groupId={groupId}
                      teams={groupAssignments[groupId]}
                      maxTeams={teamsPerGroup}
                      isAvailable={availableGroups.includes(groupId)}
                      isPlacing={phase === 'revealed'}
                      onClick={() => placeInGroup(groupId)}
                    />
                  ))}
              </div>
            </div>

            <Separator />

            {/* === Action Buttons === */}
            <div className="flex items-center justify-between">
              {phase === 'setup' && (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    {t('wizard.buttons.cancel')}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleStartDraw}>
                      <Play className="mr-2 h-4 w-4" />
                      {t('cup.sorteo.draw')}
                    </Button>
                    <Button onClick={startAutoDraw}>
                      <Zap className="mr-2 h-4 w-4" />
                      {t('cup.sorteo.drawAll')}
                    </Button>
                  </div>
                </>
              )}

              {(phase === 'idle' || phase === 'shaking' || phase === 'revealed') && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleRepeat}>
                    <RotateCcw className="mr-1 h-3 w-3" />
                    {t('cup.sorteo.repeat')}
                  </Button>
                  <Badge variant="secondary">
                    {totalPlaced}/{teams.length}
                  </Badge>
                </>
              )}

              {phase === 'complete' && (
                <>
                  <Button variant="outline" onClick={handleRepeat}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('cup.sorteo.repeat')}
                  </Button>
                  <Button onClick={handleConfirm}>
                    <Check className="mr-2 h-4 w-4" />
                    {t('cup.sorteo.confirm')}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
