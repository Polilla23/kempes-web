import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Navbar } from '../components/ui/navbar'
import { useRouter } from '@tanstack/react-router'
import { UserProvider } from '@/context/UserContext'

function RootComponent() {
  const router = useRouter()
  const pathname = router.state.location.pathname

  // Oculta el navbar en cualquier ruta que empiece por /user/
  const hideNavbar = pathname.startsWith('/user/')

  return (
    <>
      <UserProvider>
        {!hideNavbar && <Navbar />}
        <Outlet />
        <TanStackRouterDevtools />
      </UserProvider>
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
