import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { checkAuth } from '@/services/auth-guard'
import { TitleService } from '@/services/title.service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import type { GlobalRankingEntry, SeasonChampions, TitlePointConfig } from '@/types'
import { useTranslation } from 'react-i18next'
import RankingTab from './_components/ranking-tab'
import ChampionsTab from './_components/champions-tab'
import PointConfigPanel from './_components/point-config-panel'

export const Route = createFileRoute('/titles/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: TitlesPage,
})

function TitlesPage() {
  const { t } = useTranslation('titles')

  const [activeTab, setActiveTab] = useState('ranking')
  const [ranking, setRanking] = useState<GlobalRankingEntry[]>([])
  const [champions, setChampions] = useState<SeasonChampions[] | null>(null)
  const [pointConfigs, setPointConfigs] = useState<TitlePointConfig[]>([])
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [loadingRanking, setLoadingRanking] = useState(true)
  const [loadingChampions, setLoadingChampions] = useState(false)

  const fetchRanking = useCallback(async () => {
    try {
      setLoadingRanking(true)
      const [rankingData, configsData] = await Promise.all([
        TitleService.getRanking(),
        TitleService.getPointConfigs(),
      ])
      setRanking(rankingData)
      setPointConfigs(configsData)
    } catch (error) {
      console.error('Error fetching ranking:', error)
    } finally {
      setLoadingRanking(false)
    }
  }, [])

  const fetchChampions = useCallback(async (category: string) => {
    try {
      setLoadingChampions(true)
      const data = await TitleService.getSeasonChampions(category === 'ALL' ? undefined : category)
      setChampions(data)
    } catch (error) {
      console.error('Error fetching champions:', error)
    } finally {
      setLoadingChampions(false)
    }
  }, [])

  // Load ranking + point configs on mount
  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  // Load champions when switching to that tab (lazy)
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value)
      if (value === 'champions' && champions === null) {
        fetchChampions(categoryFilter)
      }
    },
    [champions, categoryFilter, fetchChampions]
  )

  // Re-fetch champions when category filter changes
  const handleCategoryChange = useCallback(
    (category: string) => {
      setCategoryFilter(category)
      fetchChampions(category)
    },
    [fetchChampions]
  )

  // Re-fetch ranking after point config update
  const handlePointConfigSave = useCallback(() => {
    fetchRanking()
  }, [fetchRanking])

  return (
    <div className="flex items-start justify-center w-full">
      <div className="flex gap-6 w-full max-w-[90%] mt-8">
        {/* Columna izquierda: Tabs de contenido */}
        <div className="flex flex-col flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="ranking" className="cursor-pointer">
                {t('tabs.ranking')}
              </TabsTrigger>
              <TabsTrigger value="champions" className="cursor-pointer">
                {t('tabs.champions')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ranking" className="mt-4">
              {loadingRanking ? (
                <RankingSkeleton />
              ) : (
                <RankingTab ranking={ranking} pointConfigs={pointConfigs} />
              )}
            </TabsContent>

            <TabsContent value="champions" className="mt-4">
              {loadingChampions ? (
                <ChampionsSkeleton />
              ) : champions !== null ? (
                <ChampionsTab
                  champions={champions}
                  categoryFilter={categoryFilter}
                  onCategoryChange={handleCategoryChange}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        </div>

        {/* Columna derecha: Panel de puntos por título */}
        <div className="w-72 shrink-0 mt-[3.5rem]">
          {loadingRanking ? (
            <Skeleton className="h-80 w-full rounded-lg" />
          ) : (
            <PointConfigPanel configs={pointConfigs} onSave={handlePointConfigSave} />
          )}
        </div>
      </div>
    </div>
  )
}

function RankingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

function ChampionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-44" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-lg" />
      ))}
    </div>
  )
}

export default TitlesPage
