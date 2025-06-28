import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/player/delete/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/player/delete/$id"!</div>
}
