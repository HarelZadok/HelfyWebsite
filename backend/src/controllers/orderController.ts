import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler';
import * as orderService from '../services/orderService';
import { AppError } from '../utils/AppError';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

const placeOrderSchema = z.object({
  shippingAddress: addressSchema,
});

export const placeOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = placeOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
  }
  const order = await orderService.placeOrder(req.user!.id, parsed.data.shippingAddress);
  res.status(201).json({ success: true, data: { order } });
});

export const listOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const { orders, meta } = await orderService.getOrders(req.user!.id, page, limit);
  res.json({ success: true, data: { orders }, meta });
});

export const getOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const order = await orderService.getOrderById(req.user!.id, Number(req.params.id));
  res.json({ success: true, data: { order } });
});
