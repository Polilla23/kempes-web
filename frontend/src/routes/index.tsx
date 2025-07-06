import { createFileRoute } from '@tanstack/react-router'
import { checkAuth } from '../services/auth-guard'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location);
  },
  component: HomePage,
})

function HomePage() {
  return <div>Hello "/"!</div>
}
