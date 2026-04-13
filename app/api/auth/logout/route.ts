import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
  
  // Clear the cookie
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}