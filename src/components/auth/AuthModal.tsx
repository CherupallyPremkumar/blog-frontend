'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { login, register } from '@/lib/api';
import { isValidEmail } from '@/lib/security';
import { useRouter } from 'next/navigation';

export default function AuthModal() {
    const {
        isAuthModalOpen,
        closeAuthModal,
        authModalMode,
        setAuthModalMode,
        refreshUser,
    } = useAuth();

    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens/mode changes
    useEffect(() => {
        if (isAuthModalOpen) {
            setFormData({ username: '', email: '', password: '' });
            setError(null);
        }
    }, [isAuthModalOpen, authModalMode]);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAuthModal();
        };
        if (isAuthModalOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isAuthModalOpen, closeAuthModal]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            closeAuthModal();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (!isLogin && formData.username.trim().length < 3) {
            setError('Username must be at least 3 characters.');
            return;
        }
        if (!isLogin && !isValidEmail(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            if (authModalMode === 'login') {
                await login(formData.username, formData.password);
            } else {
                await register(formData.username, formData.email, formData.password);
            }
            await refreshUser();
            closeAuthModal();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthModalOpen) return null;

    const isLogin = authModalMode === 'login';

    return (
        <div
            className="auth-modal-backdrop"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-label={isLogin ? 'Sign In' : 'Create Account'}
        >
            <div ref={modalRef} className="auth-modal">
                {/* Close button */}
                <button
                    onClick={closeAuthModal}
                    className="auth-modal-close"
                    aria-label="Close"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Tabs */}
                <div className="auth-modal-tabs">
                    <button
                        className={`auth-modal-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setAuthModalMode('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`auth-modal-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setAuthModalMode('register')}
                    >
                        Create Account
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="auth-modal-error">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-modal-form">
                    {!isLogin && (
                        <div className="auth-modal-field">
                            <label htmlFor="auth-username">Username</label>
                            <input
                                id="auth-username"
                                type="text"
                                required
                                autoComplete="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Choose a username"
                            />
                        </div>
                    )}

                    <div className="auth-modal-field">
                        <label htmlFor="auth-email">
                            {isLogin ? 'Email or Username' : 'Email'}
                        </label>
                        <input
                            id="auth-email"
                            type={isLogin ? 'text' : 'email'}
                            required
                            autoComplete={isLogin ? 'username' : 'email'}
                            value={isLogin ? formData.username : formData.email}
                            onChange={(e) => {
                                if (isLogin) {
                                    setFormData({ ...formData, username: e.target.value });
                                } else {
                                    setFormData({ ...formData, email: e.target.value });
                                }
                            }}
                            placeholder={isLogin ? 'you@example.com' : 'your@email.com'}
                        />
                    </div>

                    <div className="auth-modal-field">
                        <label htmlFor="auth-password">Password</label>
                        <input
                            id="auth-password"
                            type="password"
                            required
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-modal-submit"
                    >
                        {loading ? (
                            <span className="auth-modal-spinner" />
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="auth-modal-footer">
                    {isLogin ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <button onClick={() => setAuthModalMode('register')}>
                                Create one
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => setAuthModalMode('login')}>
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
