import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IOrder } from '../../types';
import { ordersApi } from '../../api/orders';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { orderStatusVariant, orderStatusLabel } from '../../utils/orderStatus';

const AccountOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.list().then((res) => setOrders(res.data.data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        title="No orders yet"
        description="When you place orders, they'll appear here."
        action={{ label: 'Start Shopping', to: '/products' }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          to={`/account/orders/${order.id}`}
          className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-sm transition-all"
        >
          {/* Order Info */}
          <div className="sm:w-40 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">#{order.id}</span>
              <Badge variant={orderStatusVariant(order.status)} className="text-xs">
                {orderStatusLabel(order.status)}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Items Preview */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex -space-x-2">
              {order.items.slice(0, 4).map((item, idx) => (
                <div
                  key={item.id}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 overflow-hidden flex items-center justify-center text-gray-400 text-xs font-medium"
                  style={{ zIndex: 4 - idx }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    item.name.charAt(0)
                  )}
                </div>
              ))}
            </div>
            <div className="ml-2 min-w-0">
              {order.items.length === 1 ? (
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.items[0].name}</p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                </p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="sm:w-44 flex-shrink-0 text-right">
            <p className="text-base font-semibold text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
            <p className="text-xs text-gray-500">
              {order.shippingCost === 0 ? 'Free Shipping' : `+ $${order.shippingCost.toFixed(2)} shipping`}
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex text-gray-300 dark:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AccountOrdersPage;
