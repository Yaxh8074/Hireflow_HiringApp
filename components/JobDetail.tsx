
import React, { useState, useEffect, useMemo } from 'react';
import type { Job, Candidate, Application } from '../types.ts';
import { JobStatus } from '../types.ts';
import type { usePaygApi } from '../hooks/usePaygApi.ts';
import CandidateCard from './CandidateCard.tsx';
import ArrowLeftIcon from './icons/ArrowLeftIcon.tsx';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon.tsx';
import ArchiveBoxXMarkIcon from './icons/ArchiveBoxXMarkIcon.tsx';

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

interface CandidateWithApplication {
    candidate: Candidate;
    application: Application;
}

const JobDetail: React.FC<JobDetailProps> = ({ jobId, api, onBack }) => {
  const job = useMemo(() => api.jobs.find(j => j.id === jobId), [jobId, api.jobs]);
  
  const candidatesForJob = useMemo(() => {
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
    const confirmationMessage = `Are you sure you want to publish this job? This will incur a job posting fee. ${api.isDiscountActive ? 'Your 90% new member discount will be applied.' : ''}`;
    if (job && window.confirm(confirmationMessage)) {
      api.updateJob(job.id, { status: JobStatus.ACTIVE });
    }
  };

  const handleClose = () => {
    if (job && window.confirm("Are you sure you want to close this job? You will not be able to add new candidates.")) {
       api.updateJob(job.id, { status: JobStatus.CLOSED });
    }
  };


  if (api.isLoading && !job) return <div>Loading...</div>;
  if (!job) return <div>Job not found.</div>;

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
                    <p className="mt-1 text-slate-500">{job.location} &bull; {job.salary}</p>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Candidates ({candidatesForJob.length})</h2>
            {candidatesForJob.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidatesForJob.map(({ candidate, application }) => (
                        <CandidateCard key={candidate.id} candidate={candidate} job={job} application={application} api={api} />
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-center py-8">No candidates have applied for this job yet.</p>
            )}
        </div>
    </div>
  );
};

export default JobDetail;