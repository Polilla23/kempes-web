import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/club/findOne/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/findOne/$id"!</div>
}
