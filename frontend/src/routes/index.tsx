import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { checkAuth } from '../services/auth-guard'
import { useUser } from '@/context/UserContext'
import HomeService, {
  type SeasonStats,
  type UserClub,
  type HomeStandings,
  type RecentMatch,
  type UserMatch,
} from '@/services/home.service'
import {
  HeroSection,
  RecentResultsCarousel,
  UserStandingsSection,
  UserMatchesSection,
  TransfersSection,
  NewsSection,
  Footer,
} from '@/components/home'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: HomePage,
})

function HomePage() {
  const { id: userId } = useUser()

  // State for all home page data
  const [isLoading, setIsLoading] = useState(true)
  const [seasonStats, setSeasonStats] = useState<SeasonStats | null>(null)
  const [userClub, setUserClub] = useState<UserClub | null>(null)
  const [homeStandings, setHomeStandings] = useState<HomeStandings | null>(null)
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([])
  const [userMatches, setUserMatches] = useState<UserMatch[]>([])

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true)

      // Fetch all data in parallel — each call is independent so one failure doesn't block the rest
      const results = await Promise.allSettled([
        HomeService.getSeasonStats(),
        HomeService.getUserClub(),
        HomeService.getHomeStandings(),
        HomeService.getRecentMatches(15),
        HomeService.getUserRecentMatches(10),
      ])

      const [statsResult, clubResult, standingsResult, matchesResult, userMatchesResult] = results

      if (statsResult.status === 'fulfilled') setSeasonStats(statsResult.value)
      if (clubResult.status === 'fulfilled') setUserClub(clubResult.value)
      if (standingsResult.status === 'fulfilled') setHomeStandings(standingsResult.value)
      if (matchesResult.status === 'fulfilled') setRecentMatches(matchesResult.value)
      if (userMatchesResult.status === 'fulfilled') setUserMatches(userMatchesResult.value)

      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        failed.forEach((r) => console.error('Home fetch error:', (r as PromiseRejectedResult).reason))
      }

      setIsLoading(false)
    }

    fetchHomeData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Full width with its own padding */}
      <HeroSection seasonStats={seasonStats} isLoading={isLoading} />

      {/* Main Content with percentage-based horizontal padding */}
      <main className="flex-1 space-y-8 px-[5%] lg:px-[7%] xl:px-[10%]">
        {/* Recent Results Carousel */}
        <RecentResultsCarousel matches={recentMatches} isLoading={isLoading} />

        {/* Standings and User Matches - Same height */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 flex">
            <UserStandingsSection
              homeStandings={homeStandings}
              userClubId={userClub?.id || null}
              isLoading={isLoading}
              className="flex-1"
            />
          </div>
          <div className="flex">
            <UserMatchesSection matches={userMatches} isLoading={isLoading} className="flex-1" />
          </div>
        </div>

        {/* Transfers and News */}
        <TransfersSection />

        {/* News Section */}
        <NewsSection />
      </main>

      {/* Footer with spacing */}
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  )
}
