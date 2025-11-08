
import React, { useState, useEffect, useRef } from 'react';
import type { Candidate, Job, Application } from '../types.ts';
import { CandidateStatus, BackgroundCheckStatus, ServiceType } from '../types.ts';
import type { usePaygApi } from '../hooks/usePaygApi.ts';
import { screenCandidate } from '../services/geminiService.ts';
import SparklesIcon from './icons/SparklesIcon.tsx';
import EnvelopeIcon from './icons/EnvelopeIcon.tsx';
import PhoneIcon from './icons/PhoneIcon.tsx';
import ShieldCheckIcon from './icons/ShieldCheckIcon.tsx';
import EllipsisVerticalIcon from './icons/EllipsisVerticalIcon.tsx';
import LinkIcon from './icons/LinkIcon.tsx';
import { usePayments } from '../contexts/PaymentContext.tsx';

interface CandidateCardProps {
  candidate: Candidate;
  job: Job;
  application: Application;
  api: ReturnType<typeof usePaygApi>;
}

const statusColors: Record<CandidateStatus, string> = {
  [CandidateStatus.APPLIED]: 'bg-blue-100 text-blue-800',
  [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800',
  [CandidateStatus.INTERVIEW]: 'bg-purple-100 text-purple-800',
  [CandidateStatus.OFFER]: 'bg-pink-100 text-pink-800',
  [CandidateStatus.HIRED]: 'bg-green-100 text-green-800',
  [CandidateStatus.WITHDRAWN]: 'bg-slate-100 text-slate-800',
};

const backgroundCheckColors: Record<BackgroundCheckStatus, string> = {
  [BackgroundCheckStatus.NOT_STARTED]: 'bg-slate-100 text-slate-800',
  [BackgroundCheckStatus.PENDING]: 'bg-yellow-100 text-yellow-800 animate-pulse',
  [BackgroundCheckStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [BackgroundCheckStatus.FLAGGED]: 'bg-red-100 text-red-800',
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, job, application, api }) => {
  const [isScreening, setIsScreening] = useState(false);
  const [notes, setNotes] = useState(application.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const { updateCandidateProfile, updateApplicationState, addBillingCharge } = api;
  const { triggerPayment } = usePayments();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // FIX: Corrected typo from actionsMenu_current to actionsMenuRef.current
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionsMenuRef]);

  const handleHire = () => {
    triggerPayment(
      {
        service: ServiceType.SUCCESSFUL_HIRE,
        description: `Successful Hire: ${candidate.name} for ${job.title}`,
      },
      async () => {
        await updateApplicationState(application.id, { status: CandidateStatus.HIRED });
        await addBillingCharge(ServiceType.SUCCESSFUL_HIRE, `Successful Hire: ${candidate.name} for ${job.title}`);
      }
    );
  };

  const handleBackgroundCheck = () => {
    triggerPayment(
      {
        service: ServiceType.BACKGROUND_CHECK,
        description: `Background Check for ${candidate.name}`,
      },
      async () => {
        await addBillingCharge(ServiceType.BACKGROUND_CHECK, `Background Check for ${candidate.name}`);
        await updateCandidateProfile(candidate.id, { backgroundCheck: BackgroundCheckStatus.PENDING });
        // Simulate completion
        setTimeout(() => {
          updateCandidateProfile(candidate.id, { backgroundCheck: BackgroundCheckStatus.COMPLETED });
        }, 5000);
      }
    );
  };

  const handleAiScreening = async () => {
    triggerPayment(
      {
        service: ServiceType.AI_SCREENING,
        description: `AI Screening for ${candidate.name}`,
      },
      async () => {
        await addBillingCharge(ServiceType.AI_SCREENING, `AI Screening for ${candidate.name}`);
        setIsScreening(true);
        const result = await screenCandidate(job.description, candidate.summary);
        await updateCandidateProfile(candidate.id, { aiScreeningResult: result });
        setIsScreening(false);
      }
    );
  };
  
  const handleAddOnService = (service: ServiceType) => {
    const serviceName = service.toString();
    triggerPayment(
      {
        service: service,
        description: `${serviceName} for ${candidate.name}`,
      },
      () => addBillingCharge(service, `${serviceName} for ${candidate.name}`)
    );
  }
  
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await updateApplicationState(application.id, { notes });
    setIsSavingNotes(false);
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/status/${application.id}`;
    navigator.clipboard.writeText(url).then(() => {
        setLinkCopied(true);
        setTimeout(() => {
            setLinkCopied(false);
            setIsActionsOpen(false);
        }, 2000);
    });
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('applicationId', application.id);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  }

  const isHired = application.status === CandidateStatus.HIRED;
  const isWithdrawn = application.status === CandidateStatus.WITHDRAWN;

  return (
    <div 
        draggable={!isWithdrawn}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-between transition-all duration-200 ease-in-out hover:shadow-md hover:border-indigo-200 ${isWithdrawn ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
             <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[application.status]}`}>{application.status}</span>
        </div>
        <p className="text-sm text-indigo-600 font-medium">{candidate.title}</p>
        <p className="text-sm text-slate-600 mt-3">{candidate.summary}</p>

        <div className="mt-4 flex flex-col space-y-2">
            <div className="flex items-center text-sm text-slate-600">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                <a href={`mailto:${candidate.email}`} title={candidate.email} className="truncate hover:underline">{candidate.email}</a>
            </div>
            <div className="flex items-center text-sm text-slate-600">
                <PhoneIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                <a href={`tel:${candidate.phone}`} title={`Call ${candidate.name}`} className="hover:underline">{candidate.phone}</a>
            </div>
        </div>

        {candidate.aiScreeningResult && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                <p className="text-sm font-semibold text-indigo-800 flex items-center"><SparklesIcon className="h-4 w-4 mr-2 text-indigo-500" /> AI Screening Summary</p>
                <p className="text-xs text-indigo-700 mt-1">{candidate.aiScreeningResult}</p>
            </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            {(application.resumeText || application.resumeFileData) && (
              <div>
                <button onClick={() => setShowResume(!showResume)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  {showResume ? 'Hide' : 'View'} Submitted Resume
                </button>
                {showResume && (
                  <div className="mt-2 p-3 bg-slate-50 border rounded-md max-h-48 overflow-y-auto">
                    {application.resumeFileData && application.resumeFileName && (
                      <a 
                        href={application.resumeFileData} 
                        download={application.resumeFileName} 
                        className="block mb-2 text-sm font-medium text-indigo-700 hover:underline"
                      >
                        Download Resume ({application.resumeFileName})
                      </a>
                    )}
                    {application.resumeText && (
                      <pre className="text-xs whitespace-pre-wrap font-mono text-slate-700">
                        {application.resumeText}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isWithdrawn && (
              <div>
                <label htmlFor={`notes-${application.id}`} className="block text-sm font-medium text-slate-700">Private Notes</label>
                <textarea
                  id={`notes-${application.id}`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., strong technical skills, good cultural fit..."
                />
                <button 
                  onClick={handleSaveNotes} 
                  disabled={isSavingNotes || api.isLoading}
                  className="mt-2 text-xs px-3 py-1.5 border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            )}
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700 flex items-center">
            <ShieldCheckIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
            Background Check:
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${backgroundCheckColors[candidate.backgroundCheck]}`}>{candidate.backgroundCheck}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isHired && !isWithdrawn && (
            <button onClick={handleHire} disabled={api.isLoading} className="flex-grow w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors">
                Hire {candidate.name.split(' ')[0]}
            </button>
          )}

          {!isWithdrawn && (
            <div className="relative flex-shrink-0" ref={actionsMenuRef}>
              <button 
                onClick={() => setIsActionsOpen(!isActionsOpen)} 
                className="p-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md disabled:opacity-50 transition-colors"
                aria-label="More actions"
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
              {isActionsOpen && (
                <div className="origin-top-right absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button onClick={handleCopyLink} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                        <LinkIcon className="h-4 w-4 mr-3" />
                        {linkCopied ? 'Copied!' : 'Copy Status Link'}
                    </button>
                    {!candidate.aiScreeningResult && (
                      <button onClick={() => { handleAiScreening(); setIsActionsOpen(false); }} disabled={isScreening || api.isLoading} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                        {isScreening ? 'Screening...' : 'AI Screen'}
                      </button>
                    )}
                    {candidate.backgroundCheck === BackgroundCheckStatus.NOT_STARTED && !isHired && (
                      <button onClick={() => { handleBackgroundCheck(); setIsActionsOpen(false); }} disabled={api.isLoading} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                        Order BGC
                      </button>
                    )}
                    <button onClick={() => { handleAddOnService(ServiceType.SKILL_ASSESSMENT); setIsActionsOpen(false); }} disabled={api.isLoading} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                      Skill Assessment
                    </button>
                    <button onClick={() => { handleAddOnService(ServiceType.VIDEO_INTERVIEW); setIsActionsOpen(false); }} disabled={api.isLoading} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                      Video Interview
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
