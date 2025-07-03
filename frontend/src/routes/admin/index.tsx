import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router"

const adminMenu = [
    { label: 'Crear usuario', path: '/admin/create-user' },
    { label: 'Crear equipo', path: '/admin/create-team' },
    { label: 'Crear jugador', path: '/admin/create-player' }
];

export const Route = createFileRoute('/admin/')({
    component: AdminPanelLayout,
})

export default function AdminPanelLayout() {
    const router = useRouter();
    const currentPath = router.state.location.pathname;

    return (
        <div className="flex min-h-[80vh] max-w-5xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-100 border-r p-6 flex flex-col gap-4">
                <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
                <nav className="flex flex-col gap-2">
                    {adminMenu.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-4 py-2 rounded transition font-medium ${
                                currentPath === item.path
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-blue-100 text-gray-700'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            {/* Main content */}
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    )
}
