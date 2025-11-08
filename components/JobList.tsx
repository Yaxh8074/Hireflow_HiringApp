
import React, { useState, useMemo } from 'react';
import type { Job, View, Application } from '../types.ts';
import { JobStatus } from '../types.ts';
import PlusIcon from './icons/PlusIcon.tsx';

interface JobListProps {
  jobs: Job[];
  applications: Application[];
  onSelectJob: (jobId: string) => void;
  onViewChange: (view: View) => void;
}

const statusColors: Record<JobStatus, string> = {
    [JobStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [JobStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
    [JobStatus.CLOSED]: 'bg-slate-100 text-slate-800',
}

const JobList: React.FC<JobListProps> = ({ jobs, applications, onSelectJob, onViewChange }) => {
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const applicationsByJob = useMemo(() => {
    return applications.reduce((acc, app) => {
      if (!acc[app.jobId]) {
        acc[app.jobId] = [];
      }
      acc[app.jobId].push(app);
      return acc;
    }, {} as Record<string, Application[]>);
  }, [applications]);

  const filteredJobs = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return jobs.filter(job => {
      const matchesStatus = filter === 'ALL' || job.status === filter;
      const matchesSearch =
        lowercasedSearchTerm === '' ||
        job.title.toLowerCase().includes(lowercasedSearchTerm) ||
        job.location.toLowerCase().includes(lowercasedSearchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [jobs, filter, searchTerm]);

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
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
             <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div className="flex-shrink-0 flex items-center space-x-2 p-1 bg-slate-100 rounded-full">
                <FilterButton status="ALL" label="All" />
                <FilterButton status={JobStatus.ACTIVE} label="Active" />
                <FilterButton status={JobStatus.DRAFT} label="Draft" />
                <FilterButton status={JobStatus.CLOSED} label="Closed" />
            </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-200">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
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
                                <p className="text-sm text-slate-500 mt-2">{applicationsByJob[job.id]?.length || 0} Candidates</p>
                            </div>
                        </div>
                    </li>
                    ))
                ) : (
                    <li className="p-6 text-center text-slate-500">
                        No jobs match your search criteria.
                    </li>
                )}
            </ul>
        </div>
    </div>
  );
};

export default JobList;
