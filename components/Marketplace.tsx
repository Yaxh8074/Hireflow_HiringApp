import React from 'react';
import type { usePaygApi } from '../hooks/usePaygApi';
import { PRICING } from '../constants';
import { ServiceType } from '../types';
import PlusIcon from './icons/PlusIcon';

interface MarketplaceProps {
  api: ReturnType<typeof usePaygApi>;
}

const serviceDescriptions: Record<ServiceType, string> = {
    [ServiceType.JOB_POST]: "Publish a job listing to attract candidates. Your job will be listed on our platform and visible to all candidates.",
    [ServiceType.BACKGROUND_CHECK]: "Verify a candidate's history and qualifications. This includes criminal record checks and employment verification.",
    [ServiceType.SUCCESSFUL_HIRE]: "A fee charged upon successfully hiring a candidate that you sourced or managed through the platform.",
    [ServiceType.AI_SCREENING]: "Use our powerful AI to get a quick, unbiased summary of a candidate's potential fit for a role based on their resume and the job description.",
    [ServiceType.SKILL_ASSESSMENT]: "Send a standardized skill test to a candidate to objectively validate their expertise in key areas like coding, design, or language proficiency.",
    [ServiceType.VIDEO_INTERVIEW]: "Use our platform to conduct and record a one-way video interview, allowing candidates to answer preset questions on their own time.",
}

const Marketplace: React.FC<MarketplaceProps> = ({ api }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handlePurchase = (service: ServiceType) => {
    const confirmationMessage = `Purchase "${service}"? This will be added to your bill. ${api.isDiscountActive ? 'Your 90% new member discount will be applied.' : ''}`;
    if(window.confirm(confirmationMessage)) {
        api.addBillingCharge(service, `One-time purchase: ${service}`);
    }
  }
  
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-1">Service Marketplace</h1>
      <p className="text-slate-500 mb-6">Purchase additional services on-demand to enhance your hiring process.</p>
      
      {api.isDiscountActive && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
            <p className="font-semibold text-indigo-800">🎉 Welcome! Your 90% discount is active!</p>
            <p className="text-sm text-indigo-600">All services are 90% off until {formatDate(api.discountEndDate)}.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(PRICING).map(([service, price]) => (
          <div key={service} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{service}</h2>
               <div className="relative group mt-2">
                    <p className="text-sm text-slate-500 line-clamp-2 h-10">
                        {serviceDescriptions[service as ServiceType]}
                    </p>
                    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none">
                        {serviceDescriptions[service as ServiceType]}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                    </div>
                </div>
            </div>
            <div className="mt-6">
              {api.isDiscountActive ? (
                <div className="flex items-baseline gap-x-2">
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(price * 0.1)}</p>
                    <p className="text-lg font-medium text-slate-400 line-through">{formatCurrency(price)}</p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(price)}</p>
              )}
              <p className="text-sm text-slate-500">per use</p>
              <button 
                onClick={() => handlePurchase(service as ServiceType)}
                disabled={api.isLoading}
                className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
                Add to Bill
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;