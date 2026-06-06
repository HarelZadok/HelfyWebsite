import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import * as cartService from '../services/cartService';
import { AppError } from '../utils/AppError';

const addItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(0),
});

export const getCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const cart = await cartService.getCart(req.user!.id);
  res.json({ success: true, data: { cart } });
});

export const addItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
  }
  const cart = await cartService.addItem(req.user!.id, parsed.data.productId, parsed.data.quantity);
  res.json({ success: true, data: { cart } });
});

export const updateItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = updateItemSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
  }
  const cart = await cartService.updateItem(req.user!.id, Number(req.params.productId), parsed.data.quantity);
  res.json({ success: true, data: { cart } });
});

export const removeItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const cart = await cartService.removeItem(req.user!.id, Number(req.params.productId));
  res.json({ success: true, data: { cart } });
});

export const clearCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await cartService.clearCart(req.user!.id);
  res.json({ success: true, data: null });
});
