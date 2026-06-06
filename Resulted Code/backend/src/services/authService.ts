import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../db/pool';
import { config } from '../config';
import { AppError } from '../utils/AppError';
import { IUser, JwtPayload } from '../types';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export const generateTokens = (payload: JwtPayload): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
};

export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> => {
  const [existing] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );
  if (existing.length > 0) {
    throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (email, passwordHash, firstName, lastName) VALUES (?, ?, ?, ?)',
    [email, passwordHash, firstName, lastName]
  );

  const userId = result.insertId;
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, email, firstName, lastName, role, createdAt FROM users WHERE id = ?',
    [userId]
  );
  const user = rows[0] as IUser;

  const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
  const { accessToken, refreshToken } = generateTokens(payload);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await pool.execute(
    'INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES (?, ?, ?)',
    [userId, refreshToken, expiresAt]
  );

  return { user, accessToken, refreshToken };
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, email, passwordHash, firstName, lastName, role, createdAt FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const row = rows[0];
  const valid = await bcrypt.compare(password, row.passwordHash as string);
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const user: IUser = {
    id: row.id as number,
    email: row.email as string,
    firstName: row.firstName as string,
    lastName: row.lastName as string,
    role: row.role as 'customer' | 'admin',
    createdAt: row.createdAt as string,
  };

  const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
  const { accessToken, refreshToken } = generateTokens(payload);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await pool.execute(
    'INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES (?, ?, ?)',
    [user.id, refreshToken, expiresAt]
  );

  return { user, accessToken, refreshToken };
};

export const refresh = async (token: string): Promise<{ accessToken: string }> => {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM refresh_tokens WHERE token = ? AND expiresAt > NOW()',
    [token]
  );
  if (rows.length === 0) {
    throw new AppError('Refresh token not found or expired', 401, 'INVALID_TOKEN');
  }

  const accessToken = jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role },
    config.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  return { accessToken };
};

export const logout = async (token: string): Promise<void> => {
  await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};

export const getMe = async (userId: number): Promise<IUser> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, email, firstName, lastName, role, createdAt FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  return rows[0] as IUser;
};
