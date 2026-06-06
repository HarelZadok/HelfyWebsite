import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ICart } from '../types';
import { cartApi } from '../api/cart';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextValue {
  cart: ICart | null;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<ICart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      cartApi.get().then((res) => setCart(res.data.data.cart)).catch(() => setCart(null));
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(async (productId: number, quantity = 1) => {
    setIsLoading(true);
    try {
      const { data } = await cartApi.addItem(productId, quantity);
      setCart(data.data.cart);
      setIsOpen(true);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add item');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (productId: number) => {
    setIsLoading(true);
    try {
      const { data } = await cartApi.removeItem(productId);
      setCart(data.data.cart);
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    setIsLoading(true);
    try {
      const { data } = await cartApi.updateItem(productId, quantity);
      setCart(data.data.cart);
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await cartApi.clear();
      setCart(null);
    } catch {
      toast.error('Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const itemCount = cart?.itemCount ?? 0;

  return (
    <CartContext.Provider value={{ cart, isOpen, isLoading, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
