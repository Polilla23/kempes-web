import { AppLayout } from "@/components/app-layout"
import { Footer } from "@/components/footer"
import { TeamPageContent } from "@/components/team/team-page-content"

export const metadata = {
  title: "Perfil de Equipo | Kempes Master League",
  description: "Estadísticas, plantilla y palmarés del equipo",
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return (
    <AppLayout>
      <div className="px-[5%] lg:px-[7%] xl:px-[10%]">
        <TeamPageContent teamSlug={slug} />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </AppLayout>
  )
}
