'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY';

interface CurrencyRate {
  [key: string]: number;
}

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  convertPrice: (amount: number, fromCurrency?: Currency) => number;
  formatPrice: (amount: number, currency?: Currency) => string;
  isLoadingRates: boolean;
  lastUpdated: Date | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'ec_setu_currency_settings';
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<CurrencyRate>({ USD: 1 });
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load saved currency preference
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedCurrency) {
          setSelectedCurrency(parsed.selectedCurrency);
        }
      }
    } catch (error) {
      console.warn('Failed to restore currency settings', error);
    }
  }, []);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoadingRates(true);
        const response = await fetch(EXCHANGE_RATE_API);
        const data = await response.json();
        
        if (data.rates) {
          setExchangeRates(data.rates);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        // Fallback rates if API fails
        setExchangeRates({
          USD: 1,
          INR: 83.5,
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.2
        });
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh rates every hour
    const interval = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Save currency preference
  const handleSetSelectedCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedCurrency: currency }));
    }
  };

  // Convert price from USD to selected currency
  const convertPrice = (amount: number, fromCurrency: Currency = 'USD'): number => {
    if (fromCurrency === selectedCurrency) return amount;
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / (exchangeRates[fromCurrency] || 1);
    return amountInUSD * (exchangeRates[selectedCurrency] || 1);
  };

  // Format price with currency symbol
  const formatPrice = (amount: number, currency: Currency = selectedCurrency): string => {
    const convertedAmount = convertPrice(amount, 'USD');
    
    const currencySymbols: Record<Currency, string> = {
      USD: '$',
      INR: '₹',
      EUR: '€',
      GBP: '£',
      JPY: '¥'
    };

    const currencyLocales: Record<Currency, string> = {
      USD: 'en-US',
      INR: 'en-IN',
      EUR: 'de-DE',
      GBP: 'en-GB',
      JPY: 'ja-JP'
    };

    // Round to appropriate decimal places
    let roundedAmount = convertedAmount;
    if (currency === 'JPY') {
      roundedAmount = Math.round(convertedAmount);
    } else {
      roundedAmount = Number(convertedAmount.toFixed(2));
    }

    return `${currencySymbols[currency]}${roundedAmount.toLocaleString(currencyLocales[currency])}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency: handleSetSelectedCurrency,
        convertPrice,
        formatPrice,
        isLoadingRates,
        lastUpdated
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}