import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { IOrder } from '../../types';
import { ordersApi } from '../../api/orders';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import OrderSummaryCard from '../../components/ui/OrderSummaryCard';
import { orderStatusVariant, orderStatusLabel } from '../../utils/orderStatus';

const AccountOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const justPlaced = (location.state as { success?: boolean } | null)?.success;

  useEffect(() => {
    if (!id) return;
    ordersApi.getById(Number(id))
      .then((res) => setOrder(res.data.data.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/account/orders" className="text-brand-600 hover:underline mt-2 block">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {justPlaced && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">Order placed successfully! Thank you for your purchase.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Link to="/account/orders" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← All Orders</Link>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">Order</h2>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Badge variant={orderStatusVariant(order.status)}>
          {orderStatusLabel(order.status)}
        </Badge>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.productId} className="flex gap-4">
              <Link to={`/products/${item.productId}`}>
                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-gray-400 text-sm font-medium">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    item.name.charAt(0)
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-brand-600 transition-colors">{item.name}</Link>
                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm flex-shrink-0">${item.lineTotal.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h3>
          {order.shippingAddress ? (
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No address on file</p>
          )}
        </div>

        <OrderSummaryCard
          rows={[
            { label: 'Subtotal', value: `$${order.subtotal.toFixed(2)}` },
            {
              label: 'Shipping',
              value: order.shippingCost === 0
                ? <span className="text-green-600 dark:text-green-400">Free</span>
                : `$${order.shippingCost.toFixed(2)}`,
            },
          ]}
          total={order.total}
        />
      </div>
    </div>
  );
};

export default AccountOrderDetailPage;
