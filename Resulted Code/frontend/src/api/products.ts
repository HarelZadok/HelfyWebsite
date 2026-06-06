import apiClient from './client';
import { ApiResponse, IProduct, ICategory } from '../types';

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  list: (filters: ProductFilters = {}) =>
    apiClient.get<ApiResponse<{ products: IProduct[] }>>('/products', { params: filters }),

  getById: (id: number) =>
    apiClient.get<ApiResponse<{ product: IProduct }>>(`/products/${id}`),

  categories: () =>
    apiClient.get<ApiResponse<{ categories: ICategory[] }>>('/categories'),
};
