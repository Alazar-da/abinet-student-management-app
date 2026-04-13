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
    
    // Create response with proper cookie settings for Vercel
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Login successful', 
        username: user.username 
      },
      { status: 200 }
    );
    
    // Set cookie with proper options for Vercel
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: true, // Must be true for HTTPS (Vercel uses HTTPS)
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      domain: process.env.VERCEL_URL ? `.${process.env.VERCEL_URL}` : undefined, // Handle Vercel domains
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