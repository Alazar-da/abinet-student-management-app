'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if current page is login or register
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  return (
    <>
      {!isAuthPage && <Header />}
      <main className={`min-h-screen bg-primary/15 ${!isAuthPage ? 'pt-16' : ''}`}>
        {children}
      </main>
    </>
  );
}