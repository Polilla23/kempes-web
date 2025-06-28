import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/findAll')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/findAll"!</div>
}
