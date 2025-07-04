import { createFileRoute } from '@tanstack/react-router'
import { checkAuth } from './auth'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location);
  },
  component: HomePage,
})

function HomePage() {
  return <div>Hello "/"!</div>
}
