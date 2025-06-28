import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/update/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/update/$id"!</div>
}
