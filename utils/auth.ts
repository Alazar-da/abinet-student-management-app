import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Use a stronger secret for production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string, username: string): string => {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};