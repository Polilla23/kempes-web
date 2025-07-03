import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '@/services/auth.service';

export type UserRole = 'ADMIN' | 'USER' | null;
export type UserId = string | null;

type UserContextType = {
    id: UserId;
    role: UserRole;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
    id: null,
    role: null,
    loading: true,
    refreshUser: async () => {},
    logout: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [id, setId] = useState<UserId>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const user = await AuthService.getProfile();
            console.log("UserContext - user recibido:", user);
            setId(user?.id ?? null);
            setRole(user?.role ?? null);
        } catch (error) {
            console.log("UserContext - error:", error);
            if (error instanceof Error && error.message.includes('Invalid token')) {
                console.log("UserContext - token inválido, limpiando sesión");
            }
            setId(null);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const refreshUser = fetchUser;

    const logout = async () => {
        await AuthService.logout();
        setId(null);
        setRole(null);
    };

    return (
        <UserContext.Provider value={{ id, role, loading, refreshUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};