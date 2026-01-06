import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { UserProvider } from '@/context/UserContext'
import { ThemeProvider } from '@/context/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useUser } from '@/context/UserContext'
import { Toaster } from 'sonner'
import Navbar from '@/components/navBar/navbar'

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

  // Render without sidebar for auth routes
  if (isAuthRoute) {
    return (
      <main className="w-full h-screen flex items-center justify-center">
        <Outlet />
        <Toaster />
      </main>
    )
  }

  // Render with sidebar for all other routes
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 w-full overflow-auto">
          <Outlet />
        </main>
        <Toaster />
      </div>
      <TanStackRouterDevtools position="top-right" />
    </SidebarProvider>
  )
}
