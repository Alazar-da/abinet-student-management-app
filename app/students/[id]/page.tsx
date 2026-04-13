'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaChurch, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt,
  FaGraduationCap,
  FaChalkboardTeacher
} from 'react-icons/fa';
import { Student } from '@/types';

export default function StudentDetailPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  useEffect(() => {
    fetchStudent();
  }, [id]);
  
  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students/${id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      } else {
        router.push('/students');
      }
    } catch (error) {
      console.error('Failed to fetch student');
      router.push('/students');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        router.push('/students');
      }
    } catch (error) {
      console.error('Failed to delete student');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-primary text-xl">Loading student details...</div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Student not found</p>
          <Link href="/students" className="text-primary hover:text-secondary mt-2 inline-block">
            Back to Students
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/students" className="text-primary hover:text-secondary inline-flex items-center">
          <FaArrowLeft className="mr-2" />
          Back to Students
        </Link>
        
        <div className="space-x-2">
          <Link
            href={`/students/edit/${student.id}`}
            className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary/90 transition inline-flex items-center"
          >
            <FaEdit className="mr-2" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition inline-flex items-center"
          >
            <FaTrash className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
          <h1 className="text-3xl font-bold">{student.name}</h1>
          <div className="flex items-center mt-2">
            <FaChurch className="mr-2" />
            <span className="text-lg">{student.church_name}</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">Personal Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaUser className="text-gray-400 w-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">እድሜ & ጾታ</p>
                    <p className="font-medium">{student.age} አመት • {student.gender === 'M' ? 'ወንድ' : 'ሴት'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-400 w-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">አድራሻ</p>
                    <p className="font-medium">{student.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaPhone className="text-gray-400 w-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">ስልክ ቁጥር</p>
                    <p className="font-medium">{student.phone_number}</p>
                  </div>
                </div>
                
              
                  <div className="flex items-center">
                    <FaChalkboardTeacher className="text-gray-400 w-5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">ክህነት</p>
                       {student.is_priest ? ( <p className="font-medium text-secondary">አለው</p>) : ( <p className="font-medium text-gray-500">የለውም</p>)}
                    </div>
                  </div>
                
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">Education</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaGraduationCap className="text-gray-400 w-5 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">መንፈሳዊ የት/ት ደረጃ፡</p>
                    <p className="font-medium">{student.church_education || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaGraduationCap className="text-gray-400 w-5 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">አለማዊ የት/ት ደረጃ፡</p>
                    <p className="font-medium">{student.outside_education || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
            <p>Member since: {new Date(student.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{student.name}</strong>? This action cannot be undone.
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