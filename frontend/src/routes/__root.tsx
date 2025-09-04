import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Navbar } from '../components/navBar/navbar'
import { useRouter } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const router = useRouter()
  const pathname = router.state.location.pathname
  const { loading, role } = useUser()

  const routesWithoutNavbar = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/resend-verification-email',
  ]

  const hideNavbar = routesWithoutNavbar.includes(pathname)
  const isAuthenticated = !loading && role !== null
  const shouldShowNavbar = !hideNavbar && isAuthenticated

  if (loading) {
    return (
      <>
        <TanStackRouterDevtools position="bottom-right" />
        <Outlet />
        <Toaster />
      </>
    )
  }

  if (shouldShowNavbar) {
    return (
      <div className="flex h-screen w-full">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 w-full overflow-auto">
          <Outlet />
        </main>
        <Toaster />
      </div>
    )
  } else {
    return (
      <main className="w-full h-screen flex items-center justify-center">
        <Outlet />
        <Toaster />
      </main>
    )
  }
}
