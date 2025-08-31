import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { routeTree } from './routeTree.gen'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/theme-provider'
import { SidebarProvider } from './components/ui/sidebar'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="kempes-web-theme">
      <SidebarProvider>
        <UserProvider>
          <RouterProvider router={router} />
        </UserProvider>
      </SidebarProvider>
    </ThemeProvider>
  </StrictMode>
)
