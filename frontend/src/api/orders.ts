import apiClient from './client';
import { ApiResponse, IOrder, IAddress } from '../types';

export const ordersApi = {
  place: (shippingAddress: IAddress) =>
    apiClient.post<ApiResponse<{ order: IOrder }>>('/orders', { shippingAddress }),

  list: (page = 1, limit = 10) =>
    apiClient.get<ApiResponse<{ orders: IOrder[] }>>('/orders', { params: { page, limit } }),

  getById: (id: number) =>
    apiClient.get<ApiResponse<{ order: IOrder }>>(`/orders/${id}`),
};
