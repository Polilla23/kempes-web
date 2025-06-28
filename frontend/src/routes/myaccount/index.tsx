import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/myaccount/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/myaccount"!</div>
}
