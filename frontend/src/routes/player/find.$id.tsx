import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/player/find/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/player/find/$id"!</div>
}
