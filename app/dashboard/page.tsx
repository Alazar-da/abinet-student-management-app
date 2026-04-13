'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUsers, FaChalkboardTeacher, FaChurch, FaUserGraduate } from 'react-icons/fa';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DashboardStats {
  totalStudents: number;
  totalPriests: number;
  averageAge: number;
  churches: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalPriests: 0,
    averageAge: 0,
    churches: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);
  
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

/*   useEffect(() => {
  fetchStats();
}, []); */
  
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const students = await res.json();
        
        const uniqueChurches = new Set(students.map((s: any) => s.church_name));
        const priests = students.filter((s: any) => s.is_priest);
        const avgAge = students.reduce((sum: number, s: any) => sum + s.age, 0) / (students.length || 1);
        
        setStats({
          totalStudents: students.length,
          totalPriests: priests.length,
          averageAge: Math.round(avgAge),
          churches: uniqueChurches.size,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };
  
  const statCards = [
    {
      title: 'አጠቃላይ ተማሪዎች',
      value: stats.totalStudents,
      icon: FaUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'አጠቃላይ ክህነት ያላቸው',
      value: stats.totalPriests,
      icon: FaChalkboardTeacher,
      color: 'bg-green-500',
    },
    {
      title: 'አማካይ እድሜ',
      value: stats.averageAge,
      icon: FaUserGraduate,
      color: 'bg-purple-500',
    },
  ];
  
if (loading) {
  return <LoadingSpinner  />;
}
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your student management system</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-full`}>
                  <Icon className="text-white text-xl" />
                </div>
                <span className="text-3xl font-bold text-primary">{card.value}</span>
              </div>
              <h3 className="text-gray-600 font-medium">{card.title}</h3>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/students">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition">
            <FaUsers className="text-4xl mb-4" />
            <h2 className="text-2xl font-bold mb-2">Manage Students</h2>
            <p>View, add, edit, or remove student records</p>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition">
            <FaUserGraduate className="text-4xl mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
            <p>Update your account information</p>
          </div>
        </Link>
      </div>
    </div>
  );
}