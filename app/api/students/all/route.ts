import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/utils/auth';

// GET - Fetch all students for export
export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    const token = cookieHeader?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];
    
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
    
    // Get search parameter for filtered export
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    
    // Build query
    let query = supabaseAdmin
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Add search filter if provided
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,` +
        `church_name.ilike.%${search}%,` +
        `phone_number.ilike.%${search}%,` +
        `address.ilike.%${search}%`
      );
    }
    
    const { data: students, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(students || []);
  } catch (error) {
    console.error('GET All Students Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}