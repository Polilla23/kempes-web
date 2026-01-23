import { AppLayout } from "@/components/app-layout"
import { Footer } from "@/components/footer"
import { PlayersPageContent } from "@/components/players/players-page-content"

export default function PlayersPage() {
  return (
    <AppLayout>
      <div className="px-[5%] lg:px-[7%] xl:px-[10%]">
        <PlayersPageContent />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </AppLayout>
  )
}
