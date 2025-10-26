
import React from 'react';
import type { usePaygApi } from '../hooks/usePaygApi';
import { PRICING } from '../constants';
import { ServiceType } from '../types';
import PlusIcon from './icons/PlusIcon';

interface MarketplaceProps {
  api: ReturnType<typeof usePaygApi>;
}

const serviceDescriptions: Record<ServiceType, string> = {
    [ServiceType.JOB_POST]: "Publish a job listing to attract candidates.",
    [ServiceType.BACKGROUND_CHECK]: "Verify a candidate's history and qualifications.",
    [ServiceType.SUCCESSFUL_HIRE]: "Fee charged upon successfully hiring a candidate through the platform.",
    [ServiceType.AI_SCREENING]: "Use AI to get a quick summary of a candidate's fit for a role.",
    [ServiceType.SKILL_ASSESSMENT]: "Send a standardized skill test to a candidate to validate their expertise.",
    [ServiceType.VIDEO_INTERVIEW]: "Use our platform to conduct and record a one-way video interview.",
}

const Marketplace: React.FC<MarketplaceProps> = ({ api }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handlePurchase = (service: ServiceType) => {
    if(window.confirm(`Purchase "${service}" for ${formatCurrency(PRICING[service])}? This will be added to your bill.`)) {
        api.addBillingCharge(service, `One-time purchase: ${service}`);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-1">Service Marketplace</h1>
      <p className="text-slate-500 mb-6">Purchase additional services on-demand to enhance your hiring process.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(PRICING).map(([service, price]) => (
          <div key={service} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{service}</h2>
              <p className="text-sm text-slate-500 mt-2">{serviceDescriptions[service as ServiceType]}</p>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(price)}</p>
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
