import { findUserByUsername } from '@/lib/db';
import { comparePassword, generateToken } from '@/utils/auth';
import { NextResponse } from 'next/server';
import { LoginCredentials } from '@/types';

export async function POST(req: Request) {
  try {
    const body: LoginCredentials = await req.json();
    const { username, password } = body;
    
    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const token = generateToken(user.id, user.username);
    const response = NextResponse.json(
      { message: 'Login successful', username: user.username },
      { status: 200 }
    );
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}