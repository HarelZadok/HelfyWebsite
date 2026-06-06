import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import QuantityStepper from '../components/ui/QuantityStepper';
import EmptyState from '../components/ui/EmptyState';
import OrderSummaryCard from '../components/ui/OrderSummaryCard';

const CartPage: React.FC = () => {
  const { cart, removeItem, updateQuantity, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={{ label: 'Start Shopping', to: '/products' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex gap-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm font-medium">{item.name.charAt(0)}</div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white hover:text-brand-600 transition-colors">{item.name}</h3>
                </Link>
                <p className="text-brand-600 dark:text-brand-400 font-bold mt-1">${item.price.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <QuantityStepper
                    value={item.quantity}
                    min={1}
                    disabled={isLoading}
                    onChange={(next) => updateQuantity(item.productId, next)}
                  />
                  <button onClick={() => removeItem(item.productId)} disabled={isLoading} className="text-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">Remove</button>
                  <span className="ml-auto font-semibold text-gray-900 dark:text-white">${item.lineTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-80 sticky top-20 self-start">
          <OrderSummaryCard
            rows={[
              { label: `Subtotal (${cart.itemCount} items)`, value: `$${cart.subtotal.toFixed(2)}` },
              { label: 'Shipping', value: <span className="text-green-600 dark:text-green-400">Free</span> },
            ]}
            total={cart.subtotal}
          >
            <Button
              className="w-full"
              size="lg"
              onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
            >
              Proceed to Checkout
            </Button>
            <Link to="/products" className="block text-center mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Continue Shopping
            </Link>
          </OrderSummaryCard>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
