import apiClient from './client';
import { ApiResponse, IUser } from '../types';

interface AuthResponse {
  user: IUser;
  accessToken: string;
}

export const authApi = {
  register: (email: string, password: string, firstName: string, lastName: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', { email, password, firstName, lastName }),

  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/auth/logout'),

  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

  me: () =>
    apiClient.get<ApiResponse<{ user: IUser }>>('/auth/me'),
};
