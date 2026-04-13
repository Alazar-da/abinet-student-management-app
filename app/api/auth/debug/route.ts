import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  const headers = Object.fromEntries(req.headers.entries());
  
  return NextResponse.json({
    hasCookie: !!cookieHeader,
    cookieValue: cookieHeader,
    allHeaders: headers,
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });
}