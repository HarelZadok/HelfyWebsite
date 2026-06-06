import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import * as authService from '../services/authService';
import { AppError } from '../utils/AppError';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
  }
  const { email, password, firstName, lastName } = parsed.data;
  const { user, accessToken, refreshToken } = await authService.register(email, password, firstName, lastName);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ success: true, data: { user, accessToken } });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
  }
  const { email, password } = parsed.data;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
  res.json({ success: true, data: { user, accessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies[REFRESH_COOKIE] as string | undefined;
  if (token) {
    await authService.logout(token);
  }
  res.clearCookie(REFRESH_COOKIE);
  res.json({ success: true, data: null });
});

export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies[REFRESH_COOKIE] as string | undefined;
  if (!token) {
    throw new AppError('No refresh token', 401, 'UNAUTHORIZED');
  }
  const { accessToken } = await authService.refresh(token);
  res.json({ success: true, data: { accessToken } });
});

export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await authService.getMe(req.user!.id);
  res.json({ success: true, data: { user } });
});
