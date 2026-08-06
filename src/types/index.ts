export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole =
  | "admin"
  | "manager"
  | "cashier"
  | "inventory_staff"
  | "owner";

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  supplierId?: string;
  purchasePrice: number;
  sellingPrice: number;
  tax: number;
  discount: number;
  quantity: number;
  minimumStock: number;
  unit: string;
  weight?: number;
  color?: string;
  size?: string;
  images: string[];
  status: ProductStatus;
  expiryDate?: Date;
  batchNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductStatus = "active" | "inactive" | "discontinued";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  company?: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  loyaltyPoints: number;
  creditBalance: number;
  membershipLevel: MembershipLevel;
  totalPurchases: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MembershipLevel = "bronze" | "silver" | "gold" | "platinum";

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  cashierId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "qr"
  | "gift_card";
export type PaymentStatus = "paid" | "pending" | "partial" | "refunded";
export type OrderStatus =
  | "pending"
  | "completed"
  | "cancelled"
  | "refunded"
  | "on_hold";

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayProfit: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalCustomers: number;
  pendingPayments: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  profit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, string>;
}