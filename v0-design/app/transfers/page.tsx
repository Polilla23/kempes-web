import { AppLayout } from "@/components/app-layout"
import { Footer } from "@/components/footer"
import { TransfersPageContent } from "@/components/transfers/transfers-page-content"

export const metadata = {
  title: "Mercado de Fichajes | FIFA Master League Online",
  description: "Todos los fichajes y movimientos del mercado",
}

export default function TransfersPage() {
  return (
    <AppLayout>
      <div className="px-[5%] lg:px-[7%] xl:px-[10%]">
        <TransfersPageContent />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </AppLayout>
  )
}
