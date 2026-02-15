'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useGetAdminQuery } from '../store/backendSlice/apiAPISlice';
import Pageloading from '@/app/Pageloading';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { token, isLoggedIn } = useSelector((state: any) => state.auth);
    const [isChecked, setIsChecked] = useState(false);

    // Trigger a query to validate the token on mount
    const { isError, error } = useGetAdminQuery(undefined, {
        skip: !token,
    });

    useEffect(() => {
        // List of public routes that don't require auth
        const publicRoutes = ['/login'];

        if (!token && !publicRoutes.includes(pathname)) {
            router.push('/login');
        } else if (token && pathname === '/login') {
            router.push('/dashboard');
        } else {
            setIsChecked(true);
        }

    }, [token, pathname, router]);

    // If we are checking auth state, show loader (optional)
    // if (!isChecked && !publicRoutes.includes(pathname)) {
    //   return <Pageloading />;
    // }

    if (isError && (error as any)?.status === 401) {
        // Error middleware handles logout/redirect, but we can double check here
        return <Pageloading />;
    }

    return children;
}
