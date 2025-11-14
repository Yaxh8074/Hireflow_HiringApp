

import React from 'react';
import type { usePaygApi } from '../hooks/usePaygApi.ts';
import { PRICING } from '../constants.ts';
import { ServiceType } from '../types.ts';
import PlusIcon from './icons/PlusIcon.tsx';
import { usePayments } from '../contexts/PaymentContext.tsx';
import { useCurrency } from '../contexts/CurrencyContext.tsx';

interface HRConnectProps {
  api: ReturnType<typeof usePaygApi>;
}

const hrServices = [
    ServiceType.HR_CONSULTATION,
    ServiceType.RECRUITMENT_ASSISTANCE,
    ServiceType.INTERVIEW_SCHEDULING,
];

const serviceDescriptions: Record<ServiceType, string> = {
    [ServiceType.HR_CONSULTATION]: "Book a 1-hour session with an HR expert to discuss strategy, compliance, or any hiring challenges you're facing.",
    [ServiceType.RECRUITMENT_ASSISTANCE]: "Get hands-on help from a professional recruiter to source, screen, and identify the top candidates for your open role.",
    [ServiceType.INTERVIEW_SCHEDULING]: "Offload the administrative burden of coordinating interview times between your team and candidates.",
    // These are not displayed on this page but are required by the type
    [ServiceType.JOB_POST]: "",
    [ServiceType.BACKGROUND_CHECK]: "",
    [ServiceType.SUCCESSFUL_HIRE]: "",
    [ServiceType.AI_SCREENING]: "",
    [ServiceType.SKILL_ASSESSMENT]: "",
    [ServiceType.VIDEO_INTERVIEW]: "",
    // FIX: Added missing AI_SOURCING to satisfy the Record<ServiceType, string> type.
    [ServiceType.AI_SOURCING]: "",
}

const HRConnect: React.FC<HRConnectProps> = ({ api }) => {
  const { triggerPayment } = usePayments();
  const { formatCurrency } = useCurrency();

  const handlePurchase = (service: ServiceType) => {
    triggerPayment(
      {
        service: service,
        description: `HR Service: ${service}`
      },
      () => api.addBillingCharge(service, `HR Service: ${service}`)
    )
  }
  
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-1">HR Connect</h1>
      <p className="text-slate-500 mb-6">Access on-demand HR professionals to assist with your hiring process.</p>
      
      {api.isDiscountActive && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
            <p className="font-semibold text-indigo-800">🎉 Welcome! Your 90% discount is active!</p>
            <p className="text-sm text-indigo-600">All services are 90% off until {formatDate(api.discountEndDate)}.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hrServices.map((service) => {
            const price = PRICING[service];
            return (
          <div key={service} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{service}</h2>
               <div className="relative group mt-2">
                    <p className="text-sm text-slate-500 line-clamp-3 h-[60px]">
                        {serviceDescriptions[service as ServiceType]}
                    </p>
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
                Purchase Service
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default HRConnect;