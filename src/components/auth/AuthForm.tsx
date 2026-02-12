'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AuthFormProps {
    type: 'login' | 'register';
    onSubmit: (data: Record<string, string>) => Promise<void>;
}

export default function AuthForm({ type, onSubmit }: AuthFormProps) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await onSubmit(formData);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-md border border-gray-100 dark:border-neutral-800">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                {type === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {type === 'register' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                        {type === 'login' ? 'Email or Username' : 'Email'}
                    </label>
                    <input
                        type="text" // text because Login allows identifier (email or username)
                        name={type === 'login' ? 'username' : 'email'} // Map to correct field expected by handler
                        // Actually, for login, we usually send 'identifier'.
                        // But my state is 'username' | 'email'.
                        // Let's stick to keeping data simple.
                        // I'll handle the mapping in the parent page or just use 'email' field in state for identifier in login.
                        // Let's use 'email' in state for Login identifier to keep it simple, or add 'identifier' field.
                        // Better: Use a generic 'identifier' field for login.
                        // For Register, we need both Email and Username.
                        // So I'll adapt the state slightly.
                        required
                        value={type === 'login' ? formData.username : formData.email}
                        onChange={(e) => {
                            if (type === 'login') {
                                setFormData({ ...formData, username: e.target.value });
                            } else {
                                setFormData({ ...formData, email: e.target.value });
                            }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Processing...' : (type === 'login' ? 'Sign In' : 'Sign Up')}
                </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600 dark:text-neutral-400">
                {type === 'login' ? (
                    <>
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Register here
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Login here
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
