import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { checkAuth } from '../../services/auth-guard'
import DashboardService, { type DashboardData } from '@/services/dashboard.service'
import {
  DashboardHeader,
  FootballPitch,
  SquadTable,
  UpcomingMatchesCard,
} from '@/components/dashboard'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [formation, setFormation] = useState('4-3-3')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const dashboardData = await DashboardService.getDashboardData()
        setData(dashboardData)
        if (dashboardData?.club?.preferredFormation) {
          setFormation(dashboardData.club.preferredFormation)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Error al cargar el dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFormationChange = useCallback((newFormation: string) => {
    setFormation(newFormation)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!data || !data.club || !data.squad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t('noClub')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Club header with palmares */}
      <DashboardHeader
        club={data.club}
        playerCount={data.squad.players.length}
      />

      {/* Main content */}
      <main className="flex-1 space-y-6 px-[5%] lg:px-[7%] xl:px-[10%] py-8">
        {/* Pitch + Upcoming matches */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <FootballPitch
              players={data.squad.players}
              formation={formation}
              onFormationChange={handleFormationChange}
            />
          </div>
          <div className="flex">
            <div className="flex-1">
              <UpcomingMatchesCard matches={data.upcomingMatches} />
            </div>
          </div>
        </div>

        {/* Full squad table */}
        <SquadTable players={data.squad.players} />
      </main>
    </div>
  )
}
