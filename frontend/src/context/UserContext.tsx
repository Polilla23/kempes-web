import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '@/services/auth.service';

export type UserRole = 'ADMIN' | 'USER' | null;

type UserContextType = {
    role: UserRole;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
    role: null,
    loading: true,
    refreshUser: async () => {},
    logout: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const userRole = await AuthService.getProfile();
            setRole(userRole);
        } catch {
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
        setRole(null);
    };

    return (
        <UserContext.Provider value={{ role, loading, refreshUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};