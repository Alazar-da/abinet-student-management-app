import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import { findUserById } from '@/lib/db';

export async function GET(req: Request) {
  try {
    // Get token from cookies - more robust parsing
    const cookieHeader = req.headers.get('cookie');
    let token = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
          token = value;
          break;
        }
      }
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token', authenticated: false },
        { status: 401 }
      );
    }
    
    const user = await findUserById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', authenticated: false },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      username: user.username, 
      userId: user.id,
      authenticated: true 
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user', authenticated: false },
      { status: 500 }
    );
  }
}