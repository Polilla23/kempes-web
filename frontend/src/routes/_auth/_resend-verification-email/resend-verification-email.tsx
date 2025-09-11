import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_resend-verification-email/resend-verification-email')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/resend-verification-email/"!</div>
}
