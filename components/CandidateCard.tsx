
import React, { useState } from 'react';
import type { Candidate, Job } from '../types';
import { CandidateStatus, BackgroundCheckStatus, ServiceType } from '../types';
import type { usePaygApi } from '../hooks/usePaygApi';
import { screenCandidate } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';

interface CandidateCardProps {
  candidate: Candidate;
  job: Job;
  api: ReturnType<typeof usePaygApi>;
}

const statusColors: Record<CandidateStatus, string> = {
  [CandidateStatus.APPLIED]: 'bg-blue-100 text-blue-800',
  [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800',
  [CandidateStatus.INTERVIEW]: 'bg-purple-100 text-purple-800',
  [CandidateStatus.OFFER]: 'bg-pink-100 text-pink-800',
  [CandidateStatus.HIRED]: 'bg-green-100 text-green-800',
};

const backgroundCheckColors: Record<BackgroundCheckStatus, string> = {
  [BackgroundCheckStatus.NOT_STARTED]: 'bg-slate-100 text-slate-800',
  [BackgroundCheckStatus.PENDING]: 'bg-yellow-100 text-yellow-800 animate-pulse',
  [BackgroundCheckStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [BackgroundCheckStatus.FLAGGED]: 'bg-red-100 text-red-800',
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, job, api }) => {
  const [isScreening, setIsScreening] = useState(false);
  const { updateCandidateState, addBillingCharge } = api;

  const handleHire = () => {
    if(window.confirm(`Are you sure you want to hire ${candidate.name}? This will incur a successful hire fee.`)) {
      updateCandidateState(candidate.id, { status: CandidateStatus.HIRED });
      addBillingCharge(ServiceType.SUCCESSFUL_HIRE, `Successful Hire: ${candidate.name} for ${job.title}`);
    }
  };

  const handleBackgroundCheck = () => {
    if(window.confirm(`Order a background check for ${candidate.name}? This will incur a fee.`)) {
      updateCandidateState(candidate.id, { backgroundCheck: BackgroundCheckStatus.PENDING });
      addBillingCharge(ServiceType.BACKGROUND_CHECK, `Background Check for ${candidate.name}`);
      // Simulate completion
      setTimeout(() => {
        updateCandidateState(candidate.id, { backgroundCheck: BackgroundCheckStatus.COMPLETED });
      }, 5000);
    }
  };

  const handleAiScreening = async () => {
    setIsScreening(true);
    addBillingCharge(ServiceType.AI_SCREENING, `AI Screening for ${candidate.name}`);
    const result = await screenCandidate(job.description, candidate.summary);
    updateCandidateState(candidate.id, { aiScreeningResult: result });
    setIsScreening(false);
  };
  
  const handleAddOnService = (service: ServiceType) => {
    const serviceName = service.toString();
    if(window.confirm(`Purchase "${serviceName}" for ${candidate.name}? This will incur a fee.`)) {
        addBillingCharge(service, `${serviceName} for ${candidate.name}`);
    }
  }

  const isHired = candidate.status === CandidateStatus.HIRED;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
             <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[candidate.status]}`}>{candidate.status}</span>
        </div>
        <p className="text-sm text-indigo-600 font-medium">{candidate.title}</p>
        <p className="text-sm text-slate-600 mt-3">{candidate.summary}</p>

        {candidate.aiScreeningResult && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                <p className="text-sm font-semibold text-indigo-800 flex items-center"><SparklesIcon className="h-4 w-4 mr-2 text-indigo-500" /> AI Screening Summary</p>
                <p className="text-xs text-indigo-700 mt-1">{candidate.aiScreeningResult}</p>
            </div>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Background Check:</span>
             <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${backgroundCheckColors[candidate.backgroundCheck]}`}>{candidate.backgroundCheck}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
            {!candidate.aiScreeningResult && (
                <button onClick={handleAiScreening} disabled={isScreening || api.isLoading} className="w-full text-xs text-center px-3 py-2 border border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md disabled:opacity-50 transition-colors col-span-2">
                    {isScreening ? 'Screening...' : 'AI Screen'}
                </button>
            )}
            {candidate.backgroundCheck === BackgroundCheckStatus.NOT_STARTED && !isHired && (
                 <button onClick={handleBackgroundCheck} disabled={api.isLoading} className="w-full text-xs text-center px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md disabled:opacity-50 transition-colors">
                    Order BGC
                </button>
            )}
            <button onClick={() => handleAddOnService(ServiceType.SKILL_ASSESSMENT)} disabled={api.isLoading} className="w-full text-xs text-center px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md disabled:opacity-50 transition-colors">
                Skill Assessment
            </button>
             <button onClick={() => handleAddOnService(ServiceType.VIDEO_INTERVIEW)} disabled={api.isLoading} className="w-full text-xs text-center px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md disabled:opacity-50 transition-colors col-span-2">
                Video Interview
            </button>
        </div>
         {!isHired && (
            <button onClick={handleHire} disabled={api.isLoading} className="w-full mt-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors">
                Hire {candidate.name.split(' ')[0]}
            </button>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
