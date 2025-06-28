import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/request-reset-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/request-reset-password"!</div>
}
