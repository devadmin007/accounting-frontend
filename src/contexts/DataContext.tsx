import React, { createContext, useContext, useState, useEffect } from 'react';
import { productAPI, salesAPI, purchaseAPI, dashboardAPI } from '@/lib/api';
import type { Product, Sale, Purchase, DashboardMetrics } from '@/lib/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface DataContextType {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  dashboardMetrics: DashboardMetrics | null;
  isLoading: boolean;
  
  // Product methods
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Sales methods
  fetchSales: (filters?: { status?: string; from?: string; to?: string }) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  
  // Purchase methods
  fetchPurchases: (filters?: { status?: string; from?: string; to?: string }) => Promise<void>;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => Promise<void>;
  
  // Dashboard methods
  fetchDashboardMetrics: (filters?: { from?: string; to?: string }) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all data on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchSales();
      fetchPurchases();
      fetchDashboardMetrics();
    }
  }, [isAuthenticated]);

  // Helper function to convert snake_case to camelCase
  const toCamelCase = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      return obj.map(toCamelCase);
    } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        result[camelKey] = toCamelCase((obj as Record<string, unknown>)[key]);
        return result;
      }, {} as Record<string, unknown>);
    }
    return obj;
  };

  // Product methods
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productAPI.getAll({ active: true });
      const productsData = toCamelCase(response.data.data || response.data) as Product[];
      setProducts(productsData);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Failed to fetch products:', axiosError);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await productAPI.create(product as Record<string, unknown>);
      const newProduct = toCamelCase(response.data.data || response.data) as Product;
      setProducts([...products, newProduct]);
      toast.success('Product added successfully');
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error('Failed to add product:', axiosError);
      toast.error(axiosError.response?.data?.error || 'Failed to add product');
      throw error;
    }
  };

  const updateProduct = async (product: Partial<Product>) => {
    try {
      const response = await productAPI.update(product.id, product as Record<string, unknown>);
      const updatedProduct = toCamelCase(response.data.data || response.data) as Product;
      setProducts(products.map((p) => (p.id === product.id ? updatedProduct : p)));
      toast.success('Product updated successfully');
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error('Failed to update product:', axiosError);
      toast.error(axiosError.response?.data?.error || 'Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productAPI.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error('Failed to delete product:', axiosError);
      toast.error(axiosError.response?.data?.error || 'Failed to delete product');
      throw error;
    }
  };

  // Sales methods
  const fetchSales = async (filters?: { status?: string; from?: string; to?: string }) => {
    try {
      setIsLoading(true);
      const response = await salesAPI.getAll(filters);
      const salesData = toCamelCase(response.data.data || response.data) as Sale[];
      setSales(salesData);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Failed to fetch sales:', axiosError);
      toast.error('Failed to load sales');
    } finally {
      setIsLoading(false);
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    try {
      const response = await salesAPI.create(sale as Record<string, unknown>);
      const newSale = toCamelCase(response.data.data || response.data) as Sale;
      setSales([newSale, ...sales]);
      
      // Refresh products to update stock
      await fetchProducts();
      
      toast.success('Sale created successfully');
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error('Failed to add sale:', axiosError);
      toast.error(axiosError.response?.data?.error || 'Failed to create sale');
      throw error;
    }
  };

  // Purchase methods
  const fetchPurchases = async (filters?: { status?: string; from?: string; to?: string }) => {
    try {
      setIsLoading(true);
      const response = await purchaseAPI.getAll(filters);
      const purchasesData = toCamelCase(response.data.data || response.data) as Purchase[];
      setPurchases(purchasesData);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Failed to fetch purchases:', axiosError);
      toast.error('Failed to load purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const addPurchase = async (purchase: Omit<Purchase, 'id' | 'createdAt'>) => {
    try {
      const response = await purchaseAPI.create(purchase as Record<string, unknown>);
      const newPurchase = toCamelCase(response.data.data || response.data) as Purchase;
      setPurchases([newPurchase, ...purchases]);
      toast.success('Purchase added successfully');
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error('Failed to add purchase:', axiosError);
      toast.error(axiosError.response?.data?.error || 'Failed to add purchase');
      throw error;
    }
  };

  // Dashboard methods
  const fetchDashboardMetrics = async (filters?: { from?: string; to?: string }) => {
    try {
      const response = await dashboardAPI.getMetrics(filters);
      const metricsData = toCamelCase(response.data.data || response.data) as DashboardMetrics;
      setDashboardMetrics(metricsData);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Failed to fetch dashboard metrics:', axiosError);
      toast.error('Failed to load dashboard metrics');
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        sales,
        purchases,
        dashboardMetrics,
        isLoading,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        fetchSales,
        addSale,
        fetchPurchases,
        addPurchase,
        fetchDashboardMetrics,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};