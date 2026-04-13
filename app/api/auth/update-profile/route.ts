import { findUserById, findUserByUsername, updateUser } from '@/lib/db';
import { hashPassword, comparePassword, verifyToken } from '@/utils/auth';
import { NextResponse } from 'next/server';
import { UpdateProfileData } from '@/types';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const token = cookieHeader?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const body: UpdateProfileData = await req.json();
    const { username, currentPassword, newPassword } = body;
    
    const user = await findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update username if changed
    if (username && username !== user.username) {
      const existingUser = await findUserByUsername(username);
      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
      await updateUser(decoded.userId, { username });
    }
    
    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required' }, { status: 400 });
      }
      
      // Get user with password
      const { data: userWithPassword } = await supabaseAdmin
        .from('users')
        .select('password')
        .eq('id', decoded.userId)
        .single();
      
      if (!userWithPassword) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const isValid = await comparePassword(currentPassword, userWithPassword.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
      
      const hashedNewPassword = await hashPassword(newPassword);
      await updateUser(decoded.userId, { password: hashedNewPassword });
    }
    
    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}