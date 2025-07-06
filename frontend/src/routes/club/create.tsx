import { createFileRoute } from '@tanstack/react-router'
import { checkAuth } from '../../services/auth-guard';

export const Route = createFileRoute('/club/create')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location);
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/club/register/"!</div>
}
