import { AppLayout } from "@/components/app-layout"
import { Footer } from "@/components/footer"
import { NewsPageContent } from "@/components/news/news-page-content"

export const metadata = {
  title: "Noticias | Kempes Master League",
  description: "Últimas noticias y anuncios de la liga",
}

export default function NewsPage() {
  return (
    <AppLayout>
      <div className="px-[5%] lg:px-[7%] xl:px-[10%]">
        <NewsPageContent />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </AppLayout>
  )
}
