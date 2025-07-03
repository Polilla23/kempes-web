import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Navbar } from '../components/ui/navbar'
import { useRouter } from '@tanstack/react-router'
import { UserProvider } from '@/context/UserContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  console.log("RootComponent - INICIO");
  const router = useRouter()
  const pathname = router.state.location.pathname

  console.log("RootComponent - pathname:", pathname);

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

  console.log("RootComponent - hideNavbar:", hideNavbar, "!hideNavbar:", !hideNavbar);

  return (
      <UserProvider>
        {!hideNavbar && <Navbar />}
        <Outlet />
        <TanStackRouterDevtools />
      </UserProvider>
  )
}