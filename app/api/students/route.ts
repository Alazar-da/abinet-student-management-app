import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/utils/auth';

// GET - Fetch students with pagination and search
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
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabaseAdmin
      .from('students')
      .select('*', { count: 'exact' });
    
    // Add search filter if provided
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,` +
        `church_name.ilike.%${search}%,` +
        `phone_number.ilike.%${search}%,` +
        `address.ilike.%${search}%`
      );
    }
    
    // Add pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data: students, error, count } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      students: students || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalItems: count || 0,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('GET Students Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Create a new student (protected)
export async function POST(request: Request) {
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
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'churchName', 'age', 'gender', 'address', 'phoneNumber'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate age
    if (body.age < 0 || body.age > 150) {
      return NextResponse.json(
        { error: 'Age must be between 0 and 150' },
        { status: 400 }
      );
    }
    
    // Validate gender
    if (!['M', 'F'].includes(body.gender)) {
      return NextResponse.json(
        { error: 'Gender must be M or F' },
        { status: 400 }
      );
    }
    
    // Format data for database
    const studentData = {
      name: body.name,
      church_name: body.churchName,
      age: parseInt(body.age),
      gender: body.gender,
      address: body.address,
      phone_number: body.phoneNumber,
      is_priest: body.isPriest || false,
      church_education: body.churchEducation || '',
      outside_education: body.outsideEducation || ''
    };
    
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .insert([studentData])
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('POST Student Error:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}