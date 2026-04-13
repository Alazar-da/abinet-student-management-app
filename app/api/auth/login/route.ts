import { NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/db';
import { comparePassword, generateToken } from '@/utils/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
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
      { 
        success: true,
        message: 'Login successful', 
        username: user.username 
      },
      { status: 200 }
    );
    
    // Cookie settings that work on Vercel
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Important: true on Vercel
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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