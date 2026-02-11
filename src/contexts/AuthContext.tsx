'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAuthToken, getMe, setAuthToken } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    openAuthModal: (mode?: 'login' | 'register') => void;
    closeAuthModal: () => void;
    isAuthModalOpen: boolean;
    authModalMode: 'login' | 'register';
    setAuthModalMode: (mode: 'login' | 'register') => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

    const refreshUser = useCallback(async () => {
        const token = getAuthToken();
        if (token) {
            try {
                const userData = await getMe();
                setUser(userData);
            } catch {
                setAuthToken(null);
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Cleanup: restore body scroll if component unmounts with modal open
    useEffect(() => {
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsAuthModalOpen(false);
        document.body.style.overflow = '';
    }, []);

    const logout = useCallback(() => {
        setAuthToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                openAuthModal,
                closeAuthModal,
                isAuthModalOpen,
                authModalMode,
                setAuthModalMode,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
