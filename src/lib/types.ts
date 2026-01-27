// User and Authentication Types
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export interface LoginActivity {
  id: string;
  userId: string;
  timestamp: string;
  ip: string;
  device: string;
  success: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  mfgDate: string;
  expDate: string;
  stockQuantity: number;
  make: string;
  description: string;
  unitPrice: number;
  costPrice: number;
  category: string;
  batchNumber: string;
  gstPercentage: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface StockHistory {
  id: string;
  productId: string;
  quantityAdded: number;
  date: string;
  userId: string;
  notes: string;
}

// Sales Types
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  totalAmount: number;
  amountReceived: number;
  amountPending: number;
  paymentMode: 'CASH' | 'ONLINE' | 'MIXED';
  cashAmount?: number;
  onlineAmount?: number;
  dueDate: string;
  items: SaleItem[];
  createdAt: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
  settledAt?: string;
}

// Purchase Types
export interface PurchaseItem {
  itemName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  supplierName: string;
  invoiceNumber: string;
  purchaseDate: string;
  totalAmount: number;
  amountPaid: number;
  amountPending: number;
  paymentMode: 'CASH' | 'ONLINE' | 'CREDIT';
  dueDate: string;
  items: PurchaseItem[];
  createdAt: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
  settledAt?: string;
}

// Payment Types
export interface Payment {
  id: string;
  referenceId: string;
  referenceType: 'sale' | 'purchase';
  amount: number;
  paymentMode: 'CASH' | 'ONLINE';
  paymentDate: string;
  notes: string;
}

// Dashboard Types
export interface DashboardMetrics {
  totalSelling: number;
  totalPurchase: number;
  totalOnlineReceived: number;
  totalCashReceived: number;
  topSellingProduct: {
    name: string;
    quantity: number;
  } | null;
}

export interface DateRange {
  from: Date;
  to: Date;
}