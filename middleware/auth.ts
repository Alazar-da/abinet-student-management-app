import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import { DecodedToken } from '@/types';

export interface AuthRequest extends NextRequest {
  user?: DecodedToken;
}

export function authMiddleware(handler: (req: AuthRequest, context: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    try {
      const token = req.cookies.get('token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      
      (req as AuthRequest).user = decoded;
      return handler(req as AuthRequest, context);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}