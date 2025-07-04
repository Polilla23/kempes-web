import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, UserRound } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from '@/components/ui/button'
import { AuthService } from "@/services/auth.service";

export const Navbar = () => {
    const { role, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await AuthService.logout();
        await logout();
        navigate({ to: '/login' });
    }
    
    return (
        <header className="w-full bg-white shadow">
            <nav className="container mx-auto flex items-center justify-between py-4 px-6">
                {/* Logo */}
                {/* <div className=flex items-center">
                    <img src="/logo.png" alt="logo" className="h-10" />
                </div>*/}
                <div className="flex-1" />

                <div className="flex items-center">
                    <ul className="flex gap-8 justify-center flex-1">
                        {/* TODO: Añadir links a las rutas (to=".") */}
                        <li>
                            <Link to="/" className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="." className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">
                                Standings
                            </Link>
                        </li>
                        <li>
                            <Link to="." className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">
                                Fixture
                            </Link>
                        </li>
                        <li>
                            <Link to="." className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">
                                Stats
                            </Link>
                        </li>
                        <li>
                            <Link to="." className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">
                                Transfers
                            </Link>
                        </li>
                        {role === 'ADMIN' && (
                            <li>
                                <Link 
                                    to="/admin"
                                    className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition"
                                >
                                    Panel Admin
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
                
                {/* User Icon & Dropdown */}
                <div className="flex-1 flex justify-end items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                            className="ml-12 p-2 rounded-full hover:bg-gray-100 transition"
                            aria-label="User menu"
                            >
                                <UserRound className="w-6 h-6" />
                            </button>
                        </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            Ver mi perfil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Button variant="ghost" onClick={handleLogout}>
                                Cerrar sesión<LogOut />
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;