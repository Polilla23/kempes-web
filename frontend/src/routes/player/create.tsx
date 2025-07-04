import { createFileRoute } from '@tanstack/react-router'
import { checkAuth } from '../auth';

export const Route = createFileRoute('/player/create')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location);
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/player/create/"!</div>
}
