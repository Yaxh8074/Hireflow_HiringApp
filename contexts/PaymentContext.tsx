
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { usePaygApi } from '../hooks/usePaygApi.ts';
import type { ServiceType } from '../types.ts';
import { PRICING } from '../constants.ts';
import PaymentModal, { type PurchaseItem } from '../components/PaymentModal.tsx';

type TriggerPaymentFn = (item: Omit<PurchaseItem, 'amount'>, onSuccess: () => Promise<any>) => void;

interface PaymentContextType {
    triggerPayment: TriggerPaymentFn;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayments = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePayments must be used within a PaymentProvider');
    }
    return context;
};

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [paymentState, setPaymentState] = useState<{
        isOpen: boolean;
        item: PurchaseItem | null;
        onSuccessCallback: (() => Promise<any>) | null;
    }>({ isOpen: false, item: null, onSuccessCallback: null });

    const api = usePaygApi();

    const triggerPayment: TriggerPaymentFn = (item, onSuccess) => {
        let finalAmount = PRICING[item.service];
        let finalDescription = item.description;

        if (api.isDiscountActive) {
            finalAmount *= 0.10; // 90% discount
        }

        setPaymentState({
            isOpen: true,
            item: { ...item, description: finalDescription, amount: finalAmount },
            onSuccessCallback: onSuccess
        });
    };

    const handlePaymentSuccess = async () => {
        if (paymentState.onSuccessCallback && paymentState.item) {
            // Execute the original action (e.g., post the job, hire candidate, etc.)
            // The callback is now responsible for also calling addBillingCharge.
            return await paymentState.onSuccessCallback();
        }
        return Promise.resolve();
    };

    const handleClose = () => {
        setPaymentState({ isOpen: false, item: null, onSuccessCallback: null });
    };

    return (
        <PaymentContext.Provider value={{ triggerPayment }}>
            {children}
            <PaymentModal
                isOpen={paymentState.isOpen}
                item={paymentState.item}
                onClose={handleClose}
                onSuccess={handlePaymentSuccess}
                isDiscountActive={api.isDiscountActive}
            />
        </PaymentContext.Provider>
    );
};
