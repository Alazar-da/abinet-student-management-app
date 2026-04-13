import { NextResponse } from 'next/server';
import { getStudentById, updateStudent, deleteStudent } from '@/lib/db';
import { verifyToken } from '@/utils/auth';

// GET - Fetch single student (protected)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const student = await getStudentById(id);
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(student);
  } catch (error) {
    console.error('GET Single Student Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT - Update student (protected)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const body = await request.json();
    
    // Check if student exists
    const existingStudent = await getStudentById(id);
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Validate if provided
    if (body.age !== undefined && (body.age < 0 || body.age > 150)) {
      return NextResponse.json(
        { error: 'Age must be between 0 and 150' },
        { status: 400 }
      );
    }
    
    if (body.gender !== undefined && !['M', 'F'].includes(body.gender)) {
      return NextResponse.json(
        { error: 'Gender must be M or F' },
        { status: 400 }
      );
    }
    
    // Build update data (only include fields that are provided)
    const studentData: any = {};
    if (body.name !== undefined) studentData.name = body.name;
    if (body.churchName !== undefined) studentData.church_name = body.churchName;
    if (body.age !== undefined) studentData.age = parseInt(body.age);
    if (body.gender !== undefined) studentData.gender = body.gender;
    if (body.address !== undefined) studentData.address = body.address;
    if (body.phoneNumber !== undefined) studentData.phone_number = body.phoneNumber;
    if (body.isPriest !== undefined) studentData.is_priest = body.isPriest;
    if (body.churchEducation !== undefined) studentData.church_education = body.churchEducation || '';
    if (body.outsideEducation !== undefined) studentData.outside_education = body.outsideEducation || '';
    
    const student = await updateStudent(id, studentData);
    
    return NextResponse.json(student);
  } catch (error) {
    console.error('PUT Student Error:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE - Remove student (protected)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    // Check if student exists
    const existingStudent = await getStudentById(id);
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    await deleteStudent(id);
    
    return NextResponse.json(
      { message: 'Student deleted successfully' }
    );
  } catch (error) {
    console.error('DELETE Student Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}