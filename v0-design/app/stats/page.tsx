import { AppLayout } from "@/components/app-layout"
import { Footer } from "@/components/footer"
import { StatsPageContent } from "@/components/stats/stats-page-content"

export const metadata = {
  title: "Estadísticas | FIFA Master League Online",
  description: "Estadísticas completas de jugadores y equipos",
}

export default function StatsPage() {
  return (
    <AppLayout>
      <div className="px-[5%] lg:px-[7%] xl:px-[10%]">
        <StatsPageContent />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </AppLayout>
  )
}
