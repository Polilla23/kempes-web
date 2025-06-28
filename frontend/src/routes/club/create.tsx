import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/club/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/club/register/"!</div>
}
