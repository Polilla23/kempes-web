import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_reset-password/form')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/_reset-password/form"!</div>
}
