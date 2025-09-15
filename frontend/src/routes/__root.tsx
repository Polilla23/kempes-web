import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { UserProvider } from '@/context/UserContext'
import { ThemeProvider } from '@/context/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useUser } from '@/context/UserContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="kempes-web-theme">
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  )
}

function AppContent() {
  const { loading } = useUser()
  const location = useLocation()

  // Debug logging
  console.log('Current pathname:', location.pathname)
  console.log('Loading state:', loading)

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Check if current route is an auth route
  const isAuthRoute =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/verify-email')

  console.log('Is auth route:', isAuthRoute)

  // Render without sidebar for auth routes
  if (isAuthRoute) {
    console.log('Rendering without sidebar')
    return (
      <>
        <Outlet />
        <TanStackRouterDevtools />
      </>
    )
  }

  // Render with sidebar for all other routes
  console.log('Rendering with sidebar')
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Make sure sidebar content is visible */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools />
    </SidebarProvider>
  )
}
