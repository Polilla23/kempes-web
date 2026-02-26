import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Medal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StandingsCupGroups } from './standings-cup-groups'
import { StandingsBracketView } from './standings-bracket-view'
import { BracketMatchDialog } from './bracket-match-dialog'
import { FixtureService } from '@/services/fixture.service'
import type { CupGroupsStatusResponse, CompetitionOption, BracketRound, BracketMatch } from '../_types/standings.types'
import { ROUND_ORDER, ROUND_LABELS } from '../_types/standings.types'

interface StandingsCupCombinedProps {
  cupGroupsData: CupGroupsStatusResponse
  competitionId: string
  allCompetitions: CompetitionOption[]
}

export function StandingsCupCombined({
  cupGroupsData,
  competitionId,
  allCompetitions,
}: StandingsCupCombinedProps) {
  const { t } = useTranslation('standings')
  const [activeTab, setActiveTab] = useState('groups')
  const [goldBracketData, setGoldBracketData] = useState<BracketRound[] | null>(null)
  const [silverBracketData, setSilverBracketData] = useState<BracketRound[] | null>(null)
  const [loadingGold, setLoadingGold] = useState(false)
  const [loadingSilver, setLoadingSilver] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null)
  const [matchDialogOpen, setMatchDialogOpen] = useState(false)

  const handleMatchClick = (match: BracketMatch) => {
    setSelectedMatch(match)
    setMatchDialogOpen(true)
  }

  // Buscar copas hijas (Gold y Silver) por parentCompetitionId
  const goldCup = useMemo(
    () => allCompetitions.find((c) => c.parentCompetitionId === competitionId && c.name.toLowerCase().includes('oro')),
    [allCompetitions, competitionId]
  )

  const silverCup = useMemo(
    () => allCompetitions.find((c) => c.parentCompetitionId === competitionId && c.name.toLowerCase().includes('plata')),
    [allCompetitions, competitionId]
  )

  // Helper para transformar matches en BracketRound[]
  const transformToBracketRounds = (matches: BracketMatch[]): BracketRound[] => {
    const rounds: Record<string, BracketMatch[]> = {}
    matches.forEach((match) => {
      const round = match.knockoutRound || 'UNKNOWN'
      if (!rounds[round]) rounds[round] = []

      let winner: 'home' | 'away' | 'draw' | undefined
      if (match.status === 'FINALIZADO') {
        if (match.homeClubGoals > match.awayClubGoals) winner = 'home'
        else if (match.awayClubGoals > match.homeClubGoals) winner = 'away'
        else winner = 'draw'
      }

      rounds[round].push({ ...match, winner })
    })

    return ROUND_ORDER
      .filter((r) => rounds[r] && rounds[r].length > 0)
      .map((r) => ({
        name: ROUND_LABELS[r] || r,
        roundKey: r,
        matches: rounds[r].sort((a, b) => a.matchdayOrder - b.matchdayOrder),
      }))
  }

  // Lazy-load Gold Cup bracket data
  useEffect(() => {
    if (activeTab === 'gold' && goldCup && !goldBracketData && !loadingGold) {
      setLoadingGold(true)
      FixtureService.getKnockoutBracket(goldCup.id)
        .then((matches) => {
          const bracketRounds = transformToBracketRounds(matches as BracketMatch[])
          setGoldBracketData(bracketRounds.length > 0 ? bracketRounds : [])
        })
        .catch((err) => {
          console.error('Error loading Gold Cup bracket:', err)
          setGoldBracketData([])
        })
        .finally(() => setLoadingGold(false))
    }
  }, [activeTab, goldCup, goldBracketData, loadingGold])

  // Lazy-load Silver Cup bracket data
  useEffect(() => {
    if (activeTab === 'silver' && silverCup && !silverBracketData && !loadingSilver) {
      setLoadingSilver(true)
      FixtureService.getKnockoutBracket(silverCup.id)
        .then((matches) => {
          const bracketRounds = transformToBracketRounds(matches as BracketMatch[])
          setSilverBracketData(bracketRounds.length > 0 ? bracketRounds : [])
        })
        .catch((err) => {
          console.error('Error loading Silver Cup bracket:', err)
          setSilverBracketData([])
        })
        .finally(() => setLoadingSilver(false))
    }
  }, [activeTab, silverCup, silverBracketData, loadingSilver])

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="groups">
            <Trophy className="mr-1.5 h-4 w-4" />
            {t('combined.groups')}
          </TabsTrigger>
          <TabsTrigger value="gold" disabled={!goldCup}>
            <Medal className="mr-1.5 h-4 w-4 text-amber-500" />
            {t('combined.goldCup')}
            {!goldCup && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({t('combined.pendingGeneration')})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="silver" disabled={!silverCup}>
            <Medal className="mr-1.5 h-4 w-4 text-slate-400" />
            {t('combined.silverCup')}
            {!silverCup && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({t('combined.pendingGeneration')})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-4">
          <StandingsCupGroups data={cupGroupsData} competitionId={competitionId} />
        </TabsContent>

        <TabsContent value="gold" className="mt-4">
          {loadingGold ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              {t('combined.goldCup')}...
            </div>
          ) : goldBracketData && goldBracketData.length > 0 ? (
            <StandingsBracketView
              bracketData={goldBracketData}
              competitionName={goldCup?.name}
              isLoading={false}
              onMatchClick={handleMatchClick}
            />
          ) : (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              {t('combined.pendingGeneration')}
            </div>
          )}
        </TabsContent>

        <TabsContent value="silver" className="mt-4">
          {loadingSilver ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              {t('combined.silverCup')}...
            </div>
          ) : silverBracketData && silverBracketData.length > 0 ? (
            <StandingsBracketView
              bracketData={silverBracketData}
              competitionName={silverCup?.name}
              isLoading={false}
              onMatchClick={handleMatchClick}
            />
          ) : (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              {t('combined.pendingGeneration')}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Match Detail Dialog */}
      <BracketMatchDialog
        match={selectedMatch}
        open={matchDialogOpen}
        onOpenChange={setMatchDialogOpen}
      />
    </div>
  )
}
