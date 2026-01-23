import { AppLayout } from "@/components/app-layout"
import { Footer } from "@/components/footer"
import { StandingsPageContent } from "@/components/standings/standings-page-content"

export const metadata = {
  title: "Clasificaciones | FIFA Master League Online",
  description: "Tablas de posiciones de todas las divisiones de mayores y menores",
}

export default function StandingsPage() {
  return (
    <AppLayout>
      <div className="px-[5%] lg:px-[7%] xl:px-[10%]">
        <StandingsPageContent />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </AppLayout>
  )
}
