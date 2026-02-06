import { createFileRoute } from '@tanstack/react-router'
import { checkAuth } from '@/services/auth-guard'
import SubmitResultPage from './_components/submit-result-page'

export const Route = createFileRoute('/submit-result/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: SubmitResultPage,
})
