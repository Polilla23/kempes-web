import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/management/components/ManagementSkeleton',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/management/components/ManagementSkeleton"!</div>
}
