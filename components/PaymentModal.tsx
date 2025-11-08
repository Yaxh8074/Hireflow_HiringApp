
import React, { useState, useEffect } from 'react';
import type { ServiceType } from '../types.ts';
import CreditCardIcon from './icons/CreditCardIcon.tsx';
import CheckCircleIcon from './icons/CheckCircleIcon.tsx';

export interface PurchaseItem {
    service: ServiceType;
    description: string;
    amount: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  item: PurchaseItem | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  isDiscountActive: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, item, onClose, onSuccess, isDiscountActive }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        await onSuccess();
        setIsSuccess(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    } catch (err) {
        setError('An error occurred with the transaction. Please try again.');
        setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-slate-900">Complete Your Purchase</h2>
              {!isProcessing && !isSuccess && (
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
              )}
            </div>

            {isSuccess ? (
                <div className="text-center py-12">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto animate-pulse" />
                    <p className="mt-4 text-lg font-medium text-slate-800">Payment Successful!</p>
                    <p className="text-slate-500">Your purchase has been confirmed.</p>
                </div>
            ) : (
                <>
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">{item.description}</span>
                            {isDiscountActive ? (
                                <div className="text-right">
                                    <p className="font-semibold text-slate-800">{formatCurrency(item.amount)}</p>
                                    <p className="text-xs text-slate-400 line-through">{formatCurrency(item.amount / 0.1)}</p>
                                </div>
                            ) : (
                                <span className="font-semibold text-slate-800">{formatCurrency(item.amount)}</span>
                            )}
                        </div>
                        {isDiscountActive && (
                            <p className="text-xs text-indigo-600 mt-1 font-medium">90% new member discount applied.</p>
                        )}
                    </div>
                    <form onSubmit={handlePayment} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700">Card Number</label>
                            <div className="relative mt-1">
                                <input type="text" id="cardNumber" className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="0000 0000 0000 0000" required />
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <CreditCardIcon className="h-5 w-5 text-slate-400" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="expiry" className="block text-sm font-medium text-slate-700">Expiry (MM/YY)</label>
                                <input type="text" id="expiry" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="MM/YY" required />
                            </div>
                            <div>
                                <label htmlFor="cvc" className="block text-sm font-medium text-slate-700">CVC</label>
                                <input type="text" id="cvc" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="123" required />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {isProcessing ? 'Processing...' : `Pay ${formatCurrency(item.amount)}`}
                        </button>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
