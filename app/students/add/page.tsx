'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { StudentInput } from '@/types';

export default function AddStudentPage() {
  const [formData, setFormData] = useState<StudentInput>({
    name: '',
    churchName: '',
    age: 0,
    gender: 'M',
    address: '',
    phoneNumber: '',
    isPriest: false,
    churchEducation: '',
    outsideEducation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        router.push('/students');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add student');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/students" className="text-primary hover:text-secondary inline-flex items-center">
          <FaArrowLeft className="mr-2" />
          Back to Students
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">አዲስ ተማሪ መዝግብ</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">ስም *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">ክርስትና ስም *</label>
              <input
                type="text"
                name="churchName"
                value={formData.churchName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">እድሜ *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="150"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">ጾታ *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                required
              >
                <option value="M">ወንድ</option>
                <option value="F">ሴት</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">አድራሻ *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">ስልክ ቁጥር *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPriest"
                  checked={formData.isPriest}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700">ክህነት አለው?</span>
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">መንፈሳዊ የት/ት ደረጃ *</label>
              <input
                type="text"
                name="churchEducation"
                value={formData.churchEducation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">አለማዊ የት/ት ደረጃ *</label>
              <input
                type="text"
                name="outsideEducation"
                value={formData.outsideEducation}
                required
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <Link
              href="/students"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition flex items-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition flex items-center"
            >
              <FaSave className="mr-2" />
              {loading ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}