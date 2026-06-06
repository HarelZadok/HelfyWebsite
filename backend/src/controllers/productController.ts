import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as productService from '../services/productService';

export const listProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    search,
    categoryId,
    minPrice,
    maxPrice,
    featured,
    sort,
    page,
    limit,
  } = req.query;

  const { products, meta } = await productService.getProducts({
    search: search as string | undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    sort: sort as string | undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.json({ success: true, data: { products }, meta });
});

export const getProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await productService.getProductById(Number(req.params.id));
  res.json({ success: true, data: { product } });
});

export const listCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const categories = await productService.getCategories();
  res.json({ success: true, data: { categories } });
});
