
import React, { useState, useMemo } from 'react';
import type { Job, View } from '../types';
import { JobStatus } from '../types';
import PlusIcon from './icons/PlusIcon';

interface JobListProps {
  jobs: Job[];
  onSelectJob: (jobId: string) => void;
  onViewChange: (view: View) => void;
}

const statusColors: Record<JobStatus, string> = {
    [JobStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [JobStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
    [JobStatus.CLOSED]: 'bg-slate-100 text-slate-800',
}

const JobList: React.FC<JobListProps> = ({ jobs, onSelectJob, onViewChange }) => {
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('ALL');

  const filteredJobs = useMemo(() => {
    if (filter === 'ALL') return jobs;
    return jobs.filter(job => job.status === filter);
  }, [jobs, filter]);

  const FilterButton: React.FC<{ status: JobStatus | 'ALL', label: string }> = ({ status, label }) => (
    <button
      onClick={() => setFilter(status)}
      className={`px-3 py-1 text-sm font-medium rounded-full ${
        filter === status
          ? 'bg-indigo-600 text-white'
          : 'bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">All Job Postings</h1>
                <p className="text-slate-500 mt-1">Select a job to view its details and candidates.</p>
            </div>
            <button
                onClick={() => onViewChange('new-job')}
                className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
                <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
                Post New Job
            </button>
        </div>
        
        <div className="mb-4 flex items-center space-x-2 p-1 bg-slate-100 rounded-full w-full sm:w-auto">
            <FilterButton status="ALL" label="All" />
            <FilterButton status={JobStatus.ACTIVE} label="Active" />
            <FilterButton status={JobStatus.DRAFT} label="Draft" />
            <FilterButton status={JobStatus.CLOSED} label="Closed" />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-200">
                {filteredJobs.map((job) => (
                <li key={job.id} onClick={() => onSelectJob(job.id)} className="p-6 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-lg font-semibold text-indigo-600">{job.title}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                {job.location} <span className="mx-2 text-slate-300">&bull;</span> {job.salary}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                             <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[job.status]}`}>{job.status}</span>
                             <p className="text-sm text-slate-500 mt-2">{job.candidateIds.length} Candidates</p>
                        </div>
                    </div>
                </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default JobList;
