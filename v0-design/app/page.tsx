"use client"

import { AppLayout } from "@/components/app-layout"
import { HeroSection } from "@/components/hero-section"
import { RecentResultsCarousel } from "@/components/recent-results-carousel"
import { UserStandingsSection } from "@/components/user-standings-section"
import { UserFixturesSection } from "@/components/user-fixtures-section"
import { TransfersSection } from "@/components/transfers-section"
import { NewsSection } from "@/components/news-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <AppLayout>
      {/* Hero - full width */}
      <HeroSection />
      
      {/* Main content with horizontal padding */}
      <div className="space-y-8 px-[5%] lg:px-[7%] xl:px-[10%]">
        {/* Carousels */}
        <RecentResultsCarousel />

        {/* Standings and Fixtures - same height */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 flex">
            <UserStandingsSection className="flex-1" />
          </div>
          <div className="flex">
            <UserFixturesSection className="flex-1" />
          </div>
        </div>
        
        {/* Transfers carousel */}
        <TransfersSection />
        
        {/* News Section */}
        <NewsSection />
      </div>
      
      {/* Footer with spacing and full width */}
      <div className="mt-12">
        <Footer />
      </div>
    </AppLayout>
  )
}
