import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import * as userService from '../services/userService';
import { AppError } from '../utils/AppError';

const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.getProfile(req.user!.id);
  res.json({ success: true, data: { user } });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
  }
  const user = await userService.updateProfile(req.user!.id, parsed.data.firstName, parsed.data.lastName);
  res.json({ success: true, data: { user } });
});

export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
  }
  await userService.changePassword(req.user!.id, parsed.data.oldPassword, parsed.data.newPassword);
  res.json({ success: true, data: null });
});
