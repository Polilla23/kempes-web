import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/player/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/player/create/"!</div>
}
