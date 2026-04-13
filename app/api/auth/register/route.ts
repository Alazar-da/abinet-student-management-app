import { createUser, findUserByUsername } from '@/lib/db';
import { hashPassword } from '@/utils/auth';
import { NextResponse } from 'next/server';
import { RegisterCredentials } from '@/types';

export async function POST(req: Request) {
  try {
    const body: RegisterCredentials = await req.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }
    
    const hashedPassword = await hashPassword(password);
    const user = await createUser(username, hashedPassword);
    
    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}