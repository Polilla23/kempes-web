import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, useLocation } from '@tanstack/react-router'
import AuthService from '@/services/auth.service'

export type UserRole = 'ADMIN' | 'USER' | null
export type UserId = string | null

type UserContextType = {
  id: UserId
  role: UserRole
  loading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  id: null,
  role: null,
  loading: true,
  isAuthenticated: false,
  refreshUser: async () => {},
  logout: async () => {},
})

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [id, setId] = useState<UserId>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const location = useLocation()

  const isAuthenticated = id !== null && role !== null

  const fetchUser = async () => {
    setLoading(true)
    try {
      const user = await AuthService.getProfile()
      setId(user?.id ?? null)
      setRole(user?.role ?? null)
    } catch (error) {
      console.log('UserContext - Authentication failed, clearing session', error)
      setId(null)
      setRole(null)

      // Only redirect if not already on auth route
      const currentPath = location.pathname
      if (
        !currentPath.startsWith('/login') &&
        !currentPath.startsWith('/forgot-password') &&
        !currentPath.startsWith('/reset-password')
      ) {
        router.navigate({ to: '/login' }) // Use /login instead of /_auth/login
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  // Simplified navigation guard - only check on location change
  useEffect(() => {
    if (loading) return

    const currentPath = location.pathname

    // Skip auth check for auth routes (login, forgot-password, reset-password)
    if (
      currentPath.startsWith('/login') ||
      currentPath.startsWith('/forgot-password') ||
      currentPath.startsWith('/reset-password') ||
      currentPath.startsWith('/verify-email')
    ) {
      return
    }

    // If not authenticated and not on auth route, redirect to login
    if (!isAuthenticated) {
      router.navigate({ to: '/login' }) // Use /login instead of /_auth/login
      return
    }

    // Role-based access control for management routes
    if (currentPath.startsWith('/management') && role !== 'ADMIN') {
      router.navigate({ to: '/' })
      return
    }
  }, [location.pathname, isAuthenticated, loading, role, router])

  const refreshUser = fetchUser

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      console.log('Logout error:', error)
    } finally {
      setId(null)
      setRole(null)
      router.navigate({ to: '/login' }) // Use /login instead of /_auth/login
    }
  }

  return (
    <UserContext.Provider
      value={{
        id,
        role,
        loading,
        isAuthenticated,
        refreshUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
