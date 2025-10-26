
import React from 'react';
import type { BillingItem } from '../types';

interface BillingSummaryProps {
  billingItems: BillingItem[];
}

const BillingSummary: React.FC<BillingSummaryProps> = ({ billingItems }) => {
  const totalCost = billingItems.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
      });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-1">Billing Summary</h1>
      <p className="text-slate-500 mb-6">A detailed breakdown of all charges on your account.</p>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {billingItems.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(item.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.service}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm font-bold text-slate-900">Total</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">{formatCurrency(totalCost)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default BillingSummary;
