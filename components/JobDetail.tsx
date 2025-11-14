

import React, { useState, useMemo } from 'react';
import type { Job, Candidate, Application } from '../types.ts';
import { JobStatus, ServiceType, CandidateStatus } from '../types.ts';
import type { usePaygApi } from '../hooks/usePaygApi.ts';
import CandidateCard from './CandidateCard.tsx';
import KanbanBoard from './KanbanBoard.tsx';
import ArrowLeftIcon from './icons/ArrowLeftIcon.tsx';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon.tsx';
import ArchiveBoxXMarkIcon from './icons/ArchiveBoxXMarkIcon.tsx';
import { usePayments } from '../contexts/PaymentContext.tsx';
import ViewColumnsIcon from './icons/ViewColumnsIcon.tsx';
import ListBulletIcon from './icons/ListBulletIcon.tsx';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon.tsx';
// FIX: Added missing import for SparklesIcon.
import SparklesIcon from './icons/SparklesIcon.tsx';
import { useCurrency } from '../contexts/CurrencyContext.tsx';


interface JobDetailProps {
  jobId: string;
  api: ReturnType<typeof usePaygApi>;
  onBack: () => void;
}

const statusColors: Record<JobStatus, string> = {
    [JobStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [JobStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
    [JobStatus.CLOSED]: 'bg-slate-100 text-slate-800',
}

export interface CandidateWithApplication {
    candidate: Candidate;
    application: Application;
}

const JobDetail: React.FC<JobDetailProps> = ({ jobId, api, onBack }) => {
  const job = useMemo(() => api.jobs.find(j => j.id === jobId), [jobId, api.jobs]);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [activeTab, setActiveTab] = useState<'pipeline' | 'sourced'>('pipeline');
  const [isSourcing, setIsSourcing] = useState(false);
  const { triggerPayment } = usePayments();
  const { formatSalaryRange } = useCurrency();
  
  const candidatesForJob = useMemo((): CandidateWithApplication[] => {
    if (!job) return [];
    return api.applications
      .filter(app => app.jobId === job.id)
      .map(app => ({
        application: app,
        candidate: api.candidates[app.candidateId]
      }))
      .filter(item => item.candidate) as CandidateWithApplication[];
  }, [job, api.applications, api.candidates]);


  const handlePublish = () => {
    if (job) {
      triggerPayment(
        {
          service: ServiceType.JOB_POST,
          description: `Job Post: ${job.title}`,
        },
        async () => {
          await api.updateJob(job.id, { status: JobStatus.ACTIVE });
          await api.addBillingCharge(ServiceType.JOB_POST, `Job Post: ${job.title}`);
        }
      );
    }
  };

  const handleClose = () => {
    if (job && window.confirm("Are you sure you want to close this job? You will not be able to add new candidates.")) {
       api.updateJob(job.id, { status: JobStatus.CLOSED });
    }
  };

  const handleSourceCandidates = async () => {
    if (!job) return;
    setIsSourcing(true);
    await api.sourceCandidates(job.id);
    setIsSourcing(false);
    setActiveTab('sourced');
  };

  const handleInvite = async (candidateId: string) => {
    if (!job) return;
    await api.inviteSourcedCandidate(job.id, candidateId);
  }

  if (api.isLoading && !job) return <div>Loading...</div>;
  if (!job) return <div>Job not found.</div>;
  
  const activeCandidates = candidatesForJob.filter(c => c.application.status !== CandidateStatus.WITHDRAWN);

  return (
    <div className="space-y-6">
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to All Jobs
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-x-3">
                        <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
                        <span className={`px-2.5 py-1 text-sm font-medium rounded-full ${statusColors[job.status]}`}>{job.status}</span>
                    </div>
                    <p className="mt-1 text-slate-500">{job.location} &bull; {formatSalaryRange(job.salary)}</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    {job.status === JobStatus.DRAFT && (
                        <button onClick={handlePublish} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                           <PaperAirplaneIcon className="h-5 w-5 mr-2 -ml-1" />
                            Publish Job
                        </button>
                    )}
                    {job.status === JobStatus.ACTIVE && (
                        <button onClick={handleClose} className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50">
                            <ArchiveBoxXMarkIcon className="h-5 w-5 mr-2 -ml-1" />
                            Close Job
                        </button>
                    )}
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Job Description</h2>
            <p className="text-slate-600 whitespace-pre-wrap">{job.description}</p>
        </div>
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex border-b border-slate-200 w-full sm:w-auto">
                    <button onClick={() => setActiveTab('pipeline')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'pipeline' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        Pipeline ({activeCandidates.length})
                    </button>
                    {job.sourcedCandidates && (
                        <button onClick={() => setActiveTab('sourced')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'sourced' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                           Sourced ({job.sourcedCandidates.length})
                        </button>
                    )}
                </div>
                {activeTab === 'pipeline' ? (
                    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                        <button onClick={() => setViewMode('board')} className={`p-1.5 rounded-md ${viewMode === 'board' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}>
                            <ViewColumnsIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <ListBulletIcon className="h-5 w-5" />
                        </button>
                    </div>
                ) : (
                    <div /> // Placeholder for alignment
                )}
            </div>
            
            {activeTab === 'pipeline' && (
                activeCandidates.length > 0 ? (
                    viewMode === 'board' ? (
                        <KanbanBoard candidatesWithApps={activeCandidates} api={api} job={job} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeCandidates.map(({ candidate, application }) => (
                                <CandidateCard key={candidate.id} candidate={candidate} job={job} application={application} api={api} />
                            ))}
                        </div>
                    )
                ) : (
                    <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg">No active candidates have applied for this job yet.</p>
                )
            )}

            {activeTab === 'sourced' && (
                 job.sourcedCandidates && job.sourcedCandidates.length > 0 ? (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                        <ul className="divide-y divide-slate-200">
                           {job.sourcedCandidates.map(sc => {
                                const candidate = api.candidates[sc.candidateId];
                                if (!candidate) return null;
                                return (
                                    <li key={sc.candidateId} className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row items-start justify-between">
                                            <div className="flex-grow">
                                                <p className="text-lg font-semibold text-indigo-600">{candidate.name}</p>
                                                <p className="text-sm text-slate-600 font-medium">{candidate.title}</p>
                                                <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                                                    <p className="text-sm font-semibold text-indigo-800 flex items-center"><SparklesIcon className="h-4 w-4 mr-2 text-indigo-500" /> AI Justification</p>
                                                    <p className="text-xs text-indigo-700 mt-1">{sc.justification}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                                                <button 
                                                    onClick={() => handleInvite(sc.candidateId)}
                                                    disabled={sc.status === 'invited' || api.isLoading}
                                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                                >
                                                    {sc.status === 'invited' ? 'Invited' : 'Invite to Apply'}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                           })}
                        </ul>
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg">No candidates sourced yet.</p>
                )
            )}
        </div>
        
        {(!job.sourcedCandidates && job.status === JobStatus.ACTIVE) && (
             <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-indigo-300" />
                <h3 className="mt-2 text-lg font-semibold text-indigo-800">Find hidden gems in your database!</h3>
                <p className="mt-1 text-sm text-indigo-700 max-w-xl mx-auto">Use the AI Sourcing Agent to scan your entire candidate database and find the best potential matches for this role.</p>
                <button 
                    onClick={handleSourceCandidates}
                    disabled={isSourcing || api.isLoading}
                    className="mt-4 inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    <SparklesIcon className={`-ml-1 mr-2 h-5 w-5 ${isSourcing ? 'animate-spin' : ''}`} />
                    {isSourcing ? 'Sourcing...' : 'Find Matching Candidates'}
                </button>
            </div>
        )}
    </div>
  );
};

export default JobDetail;