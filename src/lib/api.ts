import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Type definitions for API responses
interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// API Service Functions
export const authAPI = {
  login: (username: string, password: string): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/login', { username, password }),
  
  getCurrentUser: (): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get('/auth/me'),
  
  getLoginActivities: (): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/auth/login-activities'),
};

export const productAPI = {
  getAll: (params?: { active?: boolean; category?: string; search?: string }): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/products', { params }),
  
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/products/${id}`),
  
  create: (product: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.post('/products', product),
  
  update: (id: string, product: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.put(`/products/${id}`, product),
  
  delete: (id: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.delete(`/products/${id}`),
  
  getStockHistory: (id: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get(`/products/${id}/stock-history`),
  
  getLowStock: (threshold?: number): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/products/low-stock', { params: { threshold } }),
};

export const salesAPI = {
  getAll: (params?: { status?: string; from?: string; to?: string; customer?: string }): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/sales', { params }),
  
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/sales/${id}`),
  
  create: (sale: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.post('/sales', sale),
  
  recordPayment: (id: string, payment: { amount: number; paymentMode: string }): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.put(`/sales/${id}/payment`, payment),
};

export const purchaseAPI = {
  getAll: (params?: { status?: string; from?: string; to?: string; supplier?: string }): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/purchases', { params }),
  
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/purchases/${id}`),
  
  create: (purchase: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.post('/purchases', purchase),
  
  recordPayment: (id: string, payment: { amount: number; paymentMode: string }): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.put(`/purchases/${id}/payment`, payment),
};

export const dashboardAPI = {
  getMetrics: (params?: { from?: string; to?: string }): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get('/dashboard/metrics', { params }),
  
  getSalesChart: (params?: { from?: string; to?: string; groupBy?: string }): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/dashboard/sales-chart', { params }),
  
  getLowStock: (): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/dashboard/low-stock'),
};

export const accountAPI = {
  getOutstanding: (): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get('/accounts/outstanding'),
  
  getCustomerOutstanding: (): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/accounts/customer-outstanding'),
  
  getSupplierOutstanding: (): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/accounts/supplier-outstanding'),
};