import { supabaseAdmin } from './supabase';
import { User, Student, StudentInput } from '@/types';

// User operations
export const createUser = async (username: string, hashedPassword: string): Promise<User> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([{ username, password: hashedPassword }])
    .select('id, username, created_at')
    .single();
  
  if (error) throw error;
  return data;
};

export const findUserByUsername = async (username: string): Promise<User & { password: string } | null> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, username, created_at')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateUser = async (id: string, updates: Partial<User & { password: string }>): Promise<User> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, username, created_at')
    .single();
  
  if (error) throw error;
  return data;
};

// Student operations
export const getAllStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createStudent = async (studentData: Omit<Student, 'id' | 'created_at'>): Promise<Student> => {
  const formattedData = {
    name: studentData.name,
    church_name: studentData.church_name,
    age: studentData.age,
    gender: studentData.gender,
    address: studentData.address,
    phone_number: studentData.phone_number,
    is_priest: studentData.is_priest || false,
    church_education: studentData.church_education || '',
    outside_education: studentData.outside_education || ''
  };
  
  const { data, error } = await supabaseAdmin
    .from('students')
    .insert([formattedData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateStudent = async (id: string, studentData: Partial<Omit<Student, 'id' | 'created_at'>>): Promise<Student> => {
  const formattedData: any = {};
  
  if (studentData.name !== undefined) formattedData.name = studentData.name;
  if (studentData.church_name !== undefined) formattedData.church_name = studentData.church_name;
  if (studentData.age !== undefined) formattedData.age = studentData.age;
  if (studentData.gender !== undefined) formattedData.gender = studentData.gender;
  if (studentData.address !== undefined) formattedData.address = studentData.address;
  if (studentData.phone_number !== undefined) formattedData.phone_number = studentData.phone_number;
  if (studentData.is_priest !== undefined) formattedData.is_priest = studentData.is_priest;
  if (studentData.church_education !== undefined) formattedData.church_education = studentData.church_education || '';
  if (studentData.outside_education !== undefined) formattedData.outside_education = studentData.outside_education || '';
  
  const { data, error } = await supabaseAdmin
    .from('students')
    .update(formattedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  const { error } = await supabaseAdmin
    .from('students')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

export const getStudentById = async (id: string): Promise<Student | null> => {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};