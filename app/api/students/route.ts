import { NextResponse } from 'next/server';
import { getAllStudents, createStudent } from '@/lib/db';
import { verifyToken } from '@/utils/auth';

// GET - Fetch all students (protected)
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
    
    const students = await getAllStudents();
    return NextResponse.json(students);
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
    
    const student = await createStudent(studentData);
    
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('POST Student Error:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}