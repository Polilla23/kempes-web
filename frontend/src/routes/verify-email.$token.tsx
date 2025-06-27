import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/verify-email/$token')({
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useParams()
  return <div>Hello "/verify-email/"{token}!</div>
}
