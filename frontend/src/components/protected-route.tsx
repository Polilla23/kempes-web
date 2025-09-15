// frontend/src/components/ProtectedRoute.tsx
import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'USER' | 'ADMIN'
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/_auth/login',
}: ProtectedRouteProps) {
  const { role, loading, isAuthenticated } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.navigate({ to: fallbackPath })
      return
    }

    if (requiredRole && role !== requiredRole) {
      router.navigate({ to: '/' }) // or '/unauthorized'
      return
    }
  }, [isAuthenticated, loading, role, requiredRole, router, fallbackPath])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
