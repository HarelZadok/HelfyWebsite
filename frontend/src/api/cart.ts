import apiClient from './client';
import { ApiResponse, ICart } from '../types';

export const cartApi = {
  get: () =>
    apiClient.get<ApiResponse<{ cart: ICart }>>('/cart'),

  addItem: (productId: number, quantity: number) =>
    apiClient.post<ApiResponse<{ cart: ICart }>>('/cart/items', { productId, quantity }),

  updateItem: (productId: number, quantity: number) =>
    apiClient.patch<ApiResponse<{ cart: ICart }>>(`/cart/items/${productId}`, { quantity }),

  removeItem: (productId: number) =>
    apiClient.delete<ApiResponse<{ cart: ICart }>>(`/cart/items/${productId}`),

  clear: () =>
    apiClient.delete('/cart'),
};
