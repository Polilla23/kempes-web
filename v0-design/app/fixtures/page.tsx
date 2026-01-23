import { AppLayout } from "@/components/app-layout"
import { Footer } from "@/components/footer"
import { FixturesPageContent } from "@/components/fixtures/fixtures-page-content"

export default function FixturesPage() {
  return (
    <AppLayout>
      <div className="px-[5%] lg:px-[7%] xl:px-[10%]">
        <FixturesPageContent />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </AppLayout>
  )
}
