import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'
import { OverviewTab } from './_components/overview-tab'
import { PrizesTab } from './_components/prizes-tab'
import { InstallmentsTab } from './_components/installments-tab'
import { SalariesTab } from './_components/salaries-tab'
import { SeasonHalfService } from '@/services/season-half.service'
import { FinanceService } from '@/services/finance.service'
import type { SeasonHalf, ClubSeasonBalance, CompetitionPrize } from '@/types'

export const Route = createFileRoute('/management/finances/')({
  component: FinancesManagement,
})

function FinancesManagement() {
  const { t } = useTranslation('finances')
  const [isLoading, setIsLoading] = useState(true)
  const [seasonHalves, setSeasonHalves] = useState<SeasonHalf[]>([])
  const [activeSeasonHalf, setActiveSeasonHalf] = useState<SeasonHalf | null>(null)
  const [selectedSeasonHalfId, setSelectedSeasonHalfId] = useState<string>('')
  const [balances, setBalances] = useState<ClubSeasonBalance[]>([])
  const [prizes, setPrizes] = useState<CompetitionPrize[]>([])

  const fetchSeasonHalves = async () => {
    try {
      const [halvesRes, activeRes] = await Promise.all([
        SeasonHalfService.getSeasonHalves(),
        SeasonHalfService.getActiveSeasonHalf(),
      ])
      const halves = halvesRes.seasonHalves || []
      setSeasonHalves(halves)

      const active = activeRes.seasonHalf || null
      setActiveSeasonHalf(active)

      if (active) {
        setSelectedSeasonHalfId(active.id)
      } else if (halves.length > 0) {
        setSelectedSeasonHalfId(halves[0].id)
      }
    } catch (error) {
      console.error('Error fetching season halves:', error)
      toast.error('Error loading season halves')
    }
  }

  const fetchBalances = async (seasonHalfId: string) => {
    try {
      const response = await FinanceService.getSeasonHalfBalances(seasonHalfId)
      setBalances(response.balances || [])
    } catch (error) {
      console.error('Error fetching balances:', error)
      setBalances([])
    }
  }

  const fetchPrizes = async () => {
    try {
      const response = await FinanceService.getPrizes()
      setPrizes(response.prizes || [])
    } catch (error) {
      console.error('Error fetching prizes:', error)
      setPrizes([])
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      await fetchSeasonHalves()
      await fetchPrizes()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedSeasonHalfId) {
      fetchBalances(selectedSeasonHalfId)
    }
  }, [selectedSeasonHalfId])

  const handleRefresh = async () => {
    if (selectedSeasonHalfId) {
      await fetchBalances(selectedSeasonHalfId)
    }
    await fetchPrizes()
  }

  if (isLoading) {
    return <ClubAndUserTableSkeleton rows={8} />
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col items-center gap-2 h-full max-w-3/4 w-full">
        <h1 className="text-2xl font-bold mb-6 mt-8 select-none">{t('title')}</h1>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="prizes">{t('tabs.prizes')}</TabsTrigger>
            <TabsTrigger value="installments">{t('tabs.installments')}</TabsTrigger>
            <TabsTrigger value="salaries">{t('tabs.salaries')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              balances={balances}
              seasonHalves={seasonHalves}
              selectedSeasonHalfId={selectedSeasonHalfId}
              onSeasonHalfChange={setSelectedSeasonHalfId}
            />
          </TabsContent>

          <TabsContent value="prizes">
            <PrizesTab prizes={prizes} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="installments">
            <InstallmentsTab
              seasonHalves={seasonHalves}
              activeSeasonHalf={activeSeasonHalf}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="salaries">
            <SalariesTab
              seasonHalves={seasonHalves}
              activeSeasonHalf={activeSeasonHalf}
              selectedSeasonHalfId={selectedSeasonHalfId}
              onSeasonHalfChange={setSelectedSeasonHalfId}
              onRefresh={handleRefresh}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default FinancesManagement
