import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../db/pool';
import { AppError } from '../utils/AppError';
import { IUser } from '../types';

export const getProfile = async (userId: number): Promise<IUser> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, email, firstName, lastName, role, createdAt FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  return rows[0] as IUser;
};

export const updateProfile = async (
  userId: number,
  firstName: string,
  lastName: string
): Promise<IUser> => {
  await pool.execute(
    'UPDATE users SET firstName = ?, lastName = ? WHERE id = ?',
    [firstName, lastName, userId]
  );
  return getProfile(userId);
};

export const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT passwordHash FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  const valid = await bcrypt.compare(oldPassword, rows[0].passwordHash as string);
  if (!valid) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await pool.execute('UPDATE users SET passwordHash = ? WHERE id = ?', [newHash, userId]);
};
