import { createFileRoute } from '@tanstack/react-router'
import { checkAuth } from '../auth';

export const Route = createFileRoute('/club/delete/$id')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location);
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/delete/$id"!</div>
}
