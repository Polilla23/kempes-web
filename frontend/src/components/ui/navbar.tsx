import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, UserRound } from "lucide-react";

export const Navbar = () => {
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
                        <li className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">Home</li>
                        <li className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">Standings</li>
                        <li className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">Fixture</li>
                        <li className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">Stats</li>
                        <li className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition">Transfers</li>
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
                            Cerrar sesión<LogOut />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;