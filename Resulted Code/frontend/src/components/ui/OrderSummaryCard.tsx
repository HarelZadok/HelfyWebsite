import React from 'react';

interface SummaryRow {
  label: string;
  value: React.ReactNode;
}

interface OrderSummaryCardProps {
  rows: SummaryRow[];
  total: number;
  children?: React.ReactNode;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ rows, total, children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
    <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Order Summary</h2>
    <div className="space-y-3 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
    </div>
    <div className="border-t border-gray-100 dark:border-gray-800 my-4" />
    <div className={`flex justify-between font-bold text-lg text-gray-900 dark:text-white ${children ? 'mb-6' : ''}`}>
      <span>Total</span>
      <span>${total.toFixed(2)}</span>
    </div>
    {children}
  </div>
);

export default OrderSummaryCard;
