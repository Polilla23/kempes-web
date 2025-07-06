import { createFileRoute } from '@tanstack/react-router'
import { checkAuth } from '../../services/auth-guard';

export const Route = createFileRoute('/player/findAll')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location);
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/player/findAll"!</div>
}
