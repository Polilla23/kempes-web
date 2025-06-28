import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/player/update/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/player/update/$id"!</div>
}
