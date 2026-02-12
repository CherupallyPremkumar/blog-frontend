'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                {children}
                <AuthModal />
            </AuthProvider>
        </ErrorBoundary>
    );
}
