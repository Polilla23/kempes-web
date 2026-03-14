import { createFileRoute } from '@tanstack/react-router'
import PlazosPage from './_components/plazos-page'

export const Route = createFileRoute('/management/plazos/')({
  component: PlazosPage,
})
