import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reset-password/$token')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/reset-password/"!</div>
}
