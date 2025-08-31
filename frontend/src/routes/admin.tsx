import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import { checkAuth } from '@/services/auth-guard'
import { useEffect } from 'react'

const adminMenu = [
  { label: 'User management', path: '/admin/create-user' },
  { label: 'Club management', path: '/admin/create-club' },
  { label: 'Player management', path: '/admin/create-player' },
]

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: AdminPanelLayout,
})

export default function AdminPanelLayout() {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <div className="flex min-h-[80vh] max-w-7xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
        <nav className="flex flex-col gap-2">
          {adminMenu.map((item) => {
            const isActive = currentPath === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded transition font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
