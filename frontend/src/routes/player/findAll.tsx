import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/player/findAll')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/player/findAll"!</div>
}
