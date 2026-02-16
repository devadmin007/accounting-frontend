import type { Sale, Purchase, Product, DateRange, DashboardMetrics } from "./types";
import { format, isWithinInterval, parseISO } from "date-fns";

// Date utilities
export const isDateInRange = (date: string, range: DateRange): boolean => {
  try {
    const dateObj = parseISO(date);
    return isWithinInterval(dateObj, { start: range.from, end: range.to });
  } catch {
    return false;
  }
};

export const formatDate = (date: string): string => {
  try {
    return format(parseISO(date), "dd/MM/yyyy");
  } catch {
    return date;
  }
};

export const formatDateTime = (date: string): string => {
  try {
    return format(parseISO(date), "dd/MM/yyyy HH:mm");
  } catch {
    return date;
  }
};

// Sales calculations
export const calculateSalesMetrics = (sales: Sale[], dateRange?: DateRange) => {
  const filteredSales = dateRange ? sales.filter((sale) => isDateInRange(sale.createdAt, dateRange)) : sales;

  const totalSelling = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalReceived = filteredSales.reduce((sum, sale) => sum + sale.amountReceived, 0);
  const totalPending = filteredSales.reduce((sum, sale) => sum + sale.amountPending, 0);
  const totalOnline = filteredSales.reduce((sum, sale) => {
    if (sale.paymentMode === "ONLINE") return sum + sale.amountReceived;
    if (sale.paymentMode === "MIXED") return sum + (sale.onlineAmount || 0);
    return sum;
  }, 0);
  const totalCash = filteredSales.reduce((sum, sale) => {
    if (sale.paymentMode === "CASH") return sum + sale.amountReceived;
    if (sale.paymentMode === "MIXED") return sum + (sale.cashAmount || 0);
    return sum;
  }, 0);

  return { totalSelling, totalReceived, totalPending, totalOnline, totalCash };
};

// Purchase calculations
export const calculatePurchaseMetrics = (purchases: Purchase[], dateRange?: DateRange) => {
  const filteredPurchases = dateRange ? purchases.filter((purchase) => isDateInRange(purchase.createdAt, dateRange)) : purchases;

  const totalPurchase = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const totalPaid = filteredPurchases.reduce((sum, purchase) => sum + purchase.amountPaid, 0);
  const totalPending = filteredPurchases.reduce((sum, purchase) => sum + purchase.amountPending, 0);

  return { totalPurchase, totalPaid, totalPending };
};

// Top selling product
export const getTopSellingProduct = (sales: Sale[], products: Product[], dateRange?: DateRange) => {
  const filteredSales = dateRange ? sales.filter((sale) => isDateInRange(sale.createdAt, dateRange)) : sales;

  const productQuantities: Record<string, number> = {};

  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      productQuantities[item.productId] = (productQuantities[item.productId] || 0) + item.quantity;
    });
  });

  const topProductId = Object.entries(productQuantities).sort((a, b) => b[1] - a[1])[0];

  if (!topProductId) return null;

  const product = products.find((p) => p.id === topProductId[0]);
  return product ? { name: product.name, quantity: topProductId[1] } : null;
};

// Dashboard metrics
export function getDashboardMetrics(sales: any[] = [], purchases: any[] = [], products: any[] = [], dateRange: { from: Date; to: Date }) {
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);

  // Filter sales by date
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    return saleDate >= from && saleDate <= to;
  });

  // Filter purchases by date
  const filteredPurchases = purchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.date);
    return purchaseDate >= from && purchaseDate <= to;
  });

  // TOTAL SELLING
  const totalSelling = filteredSales.reduce((sum, sale) => sum + Number(sale.total || sale.amount || 0), 0);

  // TOTAL PURCHASE
  const totalPurchase = filteredPurchases.reduce((sum, purchase) => sum + Number(purchase.total || purchase.amount || 0), 0);

  // CASH RECEIVED
  const totalCashReceived = filteredSales.filter((sale) => sale.paymentMode === "cash").reduce((sum, sale) => sum + Number(sale.total || sale.amount || 0), 0);

  // ONLINE RECEIVED
  const totalOnlineReceived = filteredSales.filter((sale) => sale.paymentMode === "online").reduce((sum, sale) => sum + Number(sale.total || sale.amount || 0), 0);

  // TOP SELLING PRODUCT
  const productMap: Record<string, number> = {};

  filteredSales.forEach((sale) => {
    sale.items?.forEach((item: any) => {
      const qty = Number(item.quantity || 0);
      productMap[item.productName] = (productMap[item.productName] || 0) + qty;
    });
  });

  let topSellingProduct = null;

  const entries = Object.entries(productMap);
  if (entries.length > 0) {
    const [name, quantity] = entries.sort((a, b) => b[1] - a[1])[0];
    topSellingProduct = { name, quantity };
  }

  return {
    totalSelling: Number(totalSelling) || 0,
    totalPurchase: Number(totalPurchase) || 0,
    totalCashReceived: Number(totalCashReceived) || 0,
    totalOnlineReceived: Number(totalOnlineReceived) || 0,
    topSellingProduct,
  };
}

// Low stock products
export const getLowStockProducts = (products: Product[], threshold: number = 10): Product[] => {
  return products.filter((p) => p.isActive && p.stockQuantity <= threshold);
};

// Generate invoice number
export const generateInvoiceNumber = (prefix: string = "INV"): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate overdue days
export const calculateOverdueDays = (dueDate: string): number => {
  try {
    const due = parseISO(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  } catch {
    return 0;
  }
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Export to CSV
export const exportToCSV = (data: Record<string, string | number>[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",") ? `"${value}"` : value;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
