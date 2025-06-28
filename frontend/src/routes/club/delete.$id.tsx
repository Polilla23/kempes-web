import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/club/delete/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/delete/$id"!</div>
}
