import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/management/competitions/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/management/competitions/"!</div>
}
