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
  FaSearch
} from 'react-icons/fa';
import { Student } from '@/types';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    checkAuth();
    fetchStudents();
  }, []);
  
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.church_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone_number.includes(searchTerm)
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);
  
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
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        setFilteredStudents(data);
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
        setStudents(students.filter(s => s.id !== selectedStudent.id));
        setShowDeleteModal(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Failed to delete student');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-primary text-xl">Loading students...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link href="/dashboard" className="text-primary hover:text-secondary inline-flex items-center mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-primary">Manage Students</h1>
          <p className="text-gray-600 mt-2">View and manage all student records</p>
        </div>
        
        <Link
          href="/students/add"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Student</span>
        </Link>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="በስም, በክርስትና ስም, ወይም በስልክ ቁጥር ፈልግ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>
      
      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No students found</p>
          <Link href="/students/add" className="text-primary hover:text-secondary mt-2 inline-block">
            Add your first student
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
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
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedStudent.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}