import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_user/resend-verification-email')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/resend-verification-email/"!</div>
}
