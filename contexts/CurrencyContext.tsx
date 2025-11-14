

import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo, useCallback } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD';
export const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, from?: Currency) => string;
  formatSalaryRange: (salary: string) => string;
  currencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

const CURRENCY_STORAGE_KEY = 'payg_selected_currency';

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
      return (stored && CURRENCIES.includes(stored as Currency)) ? (stored as Currency) : 'USD';
  });
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (!response.ok) throw new Error('Failed to fetch currency rates');
        const data = await response.json();
        setRates(data.usd);
      } catch (error) {
        console.error('Currency API error:', error);
        // Fallback to no rates if API fails
        setRates({ usd: 1.0 }); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchRates();
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };
  
  const convertAmount = useCallback((amount: number, from: Currency = 'USD') => {
      if (!rates || isLoading) return amount; // Return original if rates not loaded
      
      const rateFromUsd = rates[currency.toLowerCase()] || 1;
      const rateToUsd = rates[from.toLowerCase()] || 1;
      
      // If the 'from' currency is USD, we just multiply by the target rate
      if (from === 'USD') {
          return amount * rateFromUsd;
      }
      // Otherwise, we convert 'from' to USD first, then to the target currency
      return (amount / rateToUsd) * rateFromUsd;

  }, [rates, currency, isLoading]);


  const formatCurrency = useCallback((amount: number, from: Currency = 'USD') => {
    const convertedAmount = convertAmount(amount, from);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(convertedAmount);
  }, [convertAmount, currency]);

  const formatSalaryRange = useCallback((salary: string) => {
    if (!salary || isLoading || !rates) return salary;

    try {
      const numbers = salary.match(/\d[\d,.]*/g);
      if (!numbers) return salary;

      return numbers.map(numStr => {
          const num = parseFloat(numStr.replace(/,/g, ''));
          return formatCurrency(num);
      }).join(' - ');
    } catch (e) {
      console.error("Error parsing salary range:", e);
      return salary; // Return original on error
    }

  }, [isLoading, rates, formatCurrency]);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    formatCurrency,
    formatSalaryRange,
    currencies: CURRENCIES,
  }), [currency, formatCurrency, formatSalaryRange]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};