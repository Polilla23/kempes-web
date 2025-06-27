import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register/$token')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/register/"!</div>
}
