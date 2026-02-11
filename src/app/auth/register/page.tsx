'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { register } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();

    const handleRegister = async (data: any) => {
        await register(data.username, data.email, data.password);
        router.push('/');
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <AuthForm type="register" onSubmit={handleRegister} />
        </div>
    );
}
