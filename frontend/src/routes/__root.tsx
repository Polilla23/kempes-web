import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Navbar } from '../components/ui/navbar'
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

  // Rutas donde NO mostrar el Navbar
  const routesWithoutNavbar = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/resend-verification-email'
  ]

  const hideNavbar = routesWithoutNavbar.includes(pathname)
  
  const isAuthenticated = !loading && role !== null
  const shouldShowNavbar = !hideNavbar && isAuthenticated

  if (loading) {
    return (
      <>
        <Outlet />
        <TanStackRouterDevtools />
        <Toaster />
      </>
    )
  }

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Outlet />
      <TanStackRouterDevtools />
      <Toaster />
    </>   
  )
}