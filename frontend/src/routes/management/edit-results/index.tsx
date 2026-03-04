import { createFileRoute } from '@tanstack/react-router'
import EditResultsPage from './_components/edit-results-page'

export const Route = createFileRoute('/management/edit-results/')({
  component: EditResultsPage,
})
