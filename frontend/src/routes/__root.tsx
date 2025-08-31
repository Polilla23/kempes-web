import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Navbar } from '../components/ui/navBar/navbar'
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

  return (
    <div className={shouldShowNavbar ? 'flex' : 'w-full'}>
      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowNavbar ? 'flex-1 p-4' : 'w-full'}>
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
