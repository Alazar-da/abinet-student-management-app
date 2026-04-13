export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  church_name: string;
  age: number;
  gender: 'M' | 'F';
  address: string;
  phone_number: string;
  is_priest: boolean;
  church_education: string;
  outside_education: string;
  created_at: string;
}

export interface StudentInput {
  name: string;
  churchName: string;
  age: number;
  gender: 'M' | 'F';
  address: string;
  phoneNumber: string;
  isPriest: boolean;
  churchEducation: string;
  outsideEducation: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface UpdateProfileData {
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AuthResponse {
  message: string;
  userId?: string;
  username?: string;
  error?: string;
}

export interface DecodedToken {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}