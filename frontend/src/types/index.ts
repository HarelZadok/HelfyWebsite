export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  phone?: string;
  createdAt: string;
}

export interface IProduct {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  stock: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ICategory {
  id: number;
  name: string;
  slug: string;
}

export interface ICartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface ICart {
  id: number;
  items: ICartItem[];
  subtotal: number;
  itemCount: number;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrderItem {
  id: number;
  productId: number | null;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface IOrder {
  id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: IAddress;
  items: IOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: IPaginationMeta;
}
