import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_user/register/$token')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/register/"!</div>
}
