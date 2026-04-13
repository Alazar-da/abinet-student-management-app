'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FaUserCircle, FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check when route changes
  
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      
      if (res.ok && data.authenticated !== false) {
        setIsAuthenticated(true);
        setUsername(data.username);
      } else {
        setIsAuthenticated(false);
        setUsername('');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setIsAuthenticated(false);
        setUsername('');
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Don't show header on auth pages
  if (isAuthPage) {
    return null;
  }
  
  if (loading) {
    return (
      <header className="bg-primary shadow-lg fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="text-white text-xl font-bold">
              Student Management System
            </div>
            <div className="w-24 h-8 bg-primary/50 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <header className="bg-primary shadow-lg fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-white text-xl font-bold">
              Student Management System
            </Link>
            <div className="space-x-4">
              <Link href="/login" className="text-white hover:text-secondary transition">
                Login
              </Link>
             {/*  <Link href="/register" className="text-white hover:text-secondary transition">
                Register
              </Link> */}
            </div>
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="bg-primary shadow-lg fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-white text-xl font-bold">
            የደቂቅ አባላት መረጃ መያዣ ስርዓት
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-white hover:text-secondary transition"
            >
              <FaUserCircle size={24} />
              <span>{username}</span>
            </button>
            
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaUser className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}