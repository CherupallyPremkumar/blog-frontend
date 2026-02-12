'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthModal from '@/components/auth/AuthModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    {children}
                    <AuthModal />
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
