'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { login } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = async (data: any) => {
        // AuthForm uses 'username' field for login identifier
        await login(data.username, data.password);
        router.push('/');
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <AuthForm type="login" onSubmit={handleLogin} />
        </div>
    );
}
