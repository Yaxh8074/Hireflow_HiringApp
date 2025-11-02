
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Import Application type
import type { Candidate, Job, Application } from '../types';
import { CandidateStatus } from '../types';
import { usePaygApi } from '../hooks/usePaygApi';
import BriefcaseIcon from './icons/BriefcaseIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface CandidatePortalProps {
    candidateId: string;
}

const statusColors: Record<CandidateStatus, string> = {
  [CandidateStatus.APPLIED]: 'bg-blue-100 text-blue-800',
  [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800',
  [CandidateStatus.INTERVIEW]: 'bg-purple-100 text-purple-800',
  [CandidateStatus.OFFER]: 'bg-pink-100 text-pink-800',
  [CandidateStatus.HIRED]: 'bg-green-100 text-green-800',
  [CandidateStatus.WITHDRAWN]: 'bg-slate-100 text-slate-800',
};

const applicationStages = [
    CandidateStatus.APPLIED,
    CandidateStatus.SCREENING,
    CandidateStatus.INTERVIEW,
    CandidateStatus.OFFER,
    CandidateStatus.HIRED,
];

const CandidatePortal: React.FC<CandidatePortalProps> = ({ candidateId }) => {
    const api = usePaygApi();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [job, setJob] = useState<Job | null>(null);
    // FIX: Add state for the application to derive status from it
    const [application, setApplication] = useState<Application | null>(null);

    useEffect(() => {
        // FIX: Reworked logic to find the latest application for a candidate, then find the corresponding job.
        // The original logic incorrectly tried to find a job by `candidateIds` which does not exist on the Job type.
        if (api.candidates && api.jobs.length > 0 && api.applications.length > 0) {
            const foundCandidate = api.candidates[candidateId] || null;
            setCandidate(foundCandidate);

            if (foundCandidate) {
                const candidateApplications = api.applications
                    .filter(app => app.candidateId === candidateId)
                    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
                
                const latestApplication = candidateApplications[0] || null;

                if (latestApplication) {
                    const foundJob = api.jobs.find(j => j.id === latestApplication.jobId) || null;
                    setJob(foundJob);
                    setApplication(latestApplication);
                } else {
                    setJob(null);
                    setApplication(null);
                }
            }
        }
    }, [candidateId, api.candidates, api.jobs, api.applications]);

    const handleWithdraw = () => {
        // FIX: Correctly call `withdrawApplication` from the API with the application ID.
        // The original `updateCandidateState` method does not exist, and status belongs to the application, not the candidate.
        if(application && window.confirm("Are you sure you want to withdraw your application? This action cannot be undone.")) {
            api.withdrawApplication(application.id);
        }
    }
    
    const currentStageIndex = useMemo(() => {
        // FIX: Get status from the application object, not the candidate object.
        if (!application) return -1;
        return applicationStages.indexOf(application.status);
    }, [application]);


    if (api.isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
         );
    }
    
    // FIX: Check for application as well.
    if (!candidate || !job || !application) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Application Not Found</h1>
                    <p className="text-slate-500 mt-2">The link may be invalid or the job posting has been removed.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto p-4 flex items-center">
                    <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
                    <span className="ml-3 text-xl font-bold text-slate-800">Innovate Inc.</span>
                </div>
            </header>
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Hello, {candidate.name}</h1>
                    <p className="text-slate-500 mt-1">Here's the current status of your application for the <span className="font-semibold text-indigo-600">{job.title}</span> position.</p>

                    <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Your Application Status</h2>
                                <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
                            </div>
                            {/* FIX: Get status from application object, not candidate. */}
                            <div className={`mt-3 sm:mt-0 px-3 py-1.5 text-sm font-medium rounded-full ${statusColors[application.status]}`}>
                                {application.status}
                            </div>
                        </div>
                        {/* FIX: Get status from application object, not candidate. */}
                        {application.status === CandidateStatus.WITHDRAWN && (
                            <p className="mt-4 text-sm text-slate-600 bg-slate-100 p-3 rounded-md">You have successfully withdrawn your application. Thank you for your interest.</p>
                        )}
                    </div>
                    
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Application Progress</h3>
                        <div className="flex items-center">
                            {applicationStages.map((stage, index) => (
                                <React.Fragment key={stage}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${index <= currentStageIndex ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                                            {index < currentStageIndex ? <CheckCircleIcon className="w-6 h-6" /> : index + 1}
                                        </div>
                                        <p className={`mt-2 text-xs text-center font-medium ${index <= currentStageIndex ? 'text-indigo-600' : 'text-slate-500'}`}>{stage}</p>
                                    </div>
                                    {index < applicationStages.length - 1 && (
                                        <div className={`flex-1 h-1 ${index < currentStageIndex ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Job Description</h2>
                        <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                            <h3 className="font-bold text-slate-700">{job.title}</h3>
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Salary:</strong> {job.salary}</p>
                            <hr className="my-4" />
                            <p>{job.description}</p>
                        </div>
                    </div>
                     {/* FIX: Get status from application object, not candidate. */}
                     {application.status !== CandidateStatus.WITHDRAWN && application.status !== CandidateStatus.HIRED && (
                        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                            <button 
                                onClick={handleWithdraw}
                                className="px-5 py-2 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Withdraw Application
                            </button>
                            <p className="text-xs text-slate-400 mt-2">If you are no longer interested in this position.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default CandidatePortal;
