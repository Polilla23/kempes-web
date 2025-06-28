import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/club/findAll')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/findAll"!</div>
}
