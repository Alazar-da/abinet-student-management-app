'use client';

import { useEffect, useState } from 'react';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (isMounted) {
          setIsAuthenticated(res.ok);
        }
      } catch (error) {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only runs once
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Header isAuthenticated={isAuthenticated} />
      <main className="min-h-screen bg-gray-50 pt-16">
        {children}
      </main>
    </>
  );
}