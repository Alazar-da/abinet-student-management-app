'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaChurch, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt,
  FaArrowLeft,
  FaSearch,
  FaFileExcel,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { Student } from '@/types';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [exporting, setExporting] = useState(false);
  const router = useRouter();
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch students when page or search changes
  useEffect(() => {
    checkAuth();
    fetchStudents();
  }, [pagination.currentPage, debouncedSearch]);
  
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
  
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/students?page=${pagination.currentPage}&limit=${pagination.itemsPerPage}&search=${encodeURIComponent(debouncedSearch)}`
      );
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedStudent) return;
    
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Refresh current page
        fetchStudents();
        setShowDeleteModal(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Failed to delete student');
    }
  };
  
  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Fetch all students (respecting current search filter)
      const res = await fetch(`/api/students/all?search=${encodeURIComponent(debouncedSearch)}`);
      const allStudents = await res.json();
      
      // Prepare data for Excel
      const excelData = allStudents.map((student: Student) => ({
        'ሙሉ ስም': student.name,
        'የክርስትና ስም': student.church_name,
        'ዕድሜ': student.age,
        'ጾታ': student.gender === 'M' ? 'ወንድ' : 'ሴት',
        'አድራሻ': student.address,
        'ስልክ ቁጥር': student.phone_number,
        'ክህነት': student.is_priest ? 'አለው' : 'የለውም',
        'መንፈሳዊ የት/ት ደረጃ': student.church_education || 'አልተገለጸም',
        'አለማዊ የት/ት ደረጃ': student.outside_education || 'አልተገለጸም',
        'የተመዘገበበት ቀን': new Date(student.created_at).toLocaleDateString('et-ET'),
      }));
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-size columns (basic implementation)
      const maxWidth = 30;
      ws['!cols'] = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ተማሪዎች');
      
      // Generate filename with current date
      const fileName = `ተማሪዎች_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Export file
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('ኤክሴል ፋይል ማውጣት አልተቻለም');
    } finally {
      setExporting(false);
    }
  };
  
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };
  
  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-primary text-xl">ተማሪዎችን በማምጣት ላይ...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <Link href="/dashboard" className="text-primary hover:text-secondary inline-flex items-center mb-4">
            <FaArrowLeft className="mr-2" />
            ወደ ዳሽቦርድ ተመለስ
          </Link>
          <h1 className="text-3xl font-bold text-primary">ተማሪዎችን መያዝ</h1>
          <p className="text-gray-600 mt-2">ሁሉንም የተማሪ መዝገቦች ይመልከቱ እና ያስተዳድሩ</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
          >
            <FaFileExcel />
            <span>{exporting ? 'በማውጣት ላይ...' : 'ወደ Excel ቀይር'}</span>
          </button>
          
          <Link
            href="/students/add"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition flex items-center space-x-2"
          >
            <FaPlus />
            <span>አዲስ ተማሪ መዝግብ</span>
          </Link>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="በስም, በቤተ ክርስቲያን ስም, ወይም በስልክ ቁጥር ፈልግ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>
      
      {/* Students Grid */}
      {students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">ምንም ተማሪዎች አልተገኙም</p>
          <Link href="/students/add" className="text-primary hover:text-secondary mt-2 inline-block">
            የመጀመሪያ ተማሪዎን ይጨምሩ
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
                  <h3 className="text-xl font-bold">{student.name}</h3>
                  <div className="flex items-center mt-1">
                    <FaChurch className="mr-1" />
                    <span className="text-sm">{student.church_name}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-2" />
                      <span>{student.age} አመት • {student.gender === 'M' ? 'ወንድ' : 'ሴት'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2" />
                      <span className="text-sm">{student.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="mr-2" />
                      <span>{student.phone_number}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      ክህነት:  
                      {student.is_priest ? (
                        <div className="inline-block bg-secondary/10 text-secondary px-2 py-1 rounded text-xs font-semibold">
                          አለው
                        </div>
                      ) : (
                        <div className="inline-block bg-gray-200 text-gray-500 px-2 py-1 rounded text-xs font-semibold">
                          የለውም
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Link
                      href={`/students/${student.id}`}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                    >
                      <FaEye />
                    </Link>
                    <Link
                      href={`/students/edit/${student.id}`}
                      className="bg-secondary text-white p-2 rounded hover:bg-secondary/90 transition"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowDeleteModal(true);
                      }}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-3 mt-8">
              <button
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <FaChevronLeft className="mr-1" />
                ቀዳሚ
              </button>
              
              <span className="text-gray-700">
                ገጽ {pagination.currentPage} ከ {pagination.totalPages}
              </span>
              
              <button
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                ቀጣይ
                <FaChevronRight className="ml-1" />
              </button>
            </div>
          )}
          
          {/* Items info */}
          <div className="text-center text-sm text-gray-500 mt-4">
            በድምሩ {pagination.totalItems} ተማሪዎች ውስጥ {students.length} በማሳየት ላይ
          </div>
        </>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">መሰረዝ አረጋግጥ</h2>
            <p className="text-gray-600 mb-6">
              እርግጠኛ ነዎት <strong>{selectedStudent.name}</strong> መሰረዝ ይፈልጋሉ? ይህ ተግባር ሊቀለበስ አይችልም፡፡
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                ሰርዝ
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                አቋርጥ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}