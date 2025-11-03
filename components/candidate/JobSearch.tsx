
import React, { useState, useMemo } from 'react';
import type { usePaygApi } from '../../hooks/usePaygApi.ts';
import { JobStatus } from '../../types.ts';

interface JobSearchProps {
  api: ReturnType<typeof usePaygApi>;
  onSelectJob: (jobId: string) => void;
}

const JobSearch: React.FC<JobSearchProps> = ({ api, onSelectJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const activeJobs = useMemo(() => api.jobs.filter(job => job.status === JobStatus.ACTIVE), [api.jobs]);

  const filteredJobs = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    if (!lowercasedSearchTerm) return activeJobs;

    return activeJobs.filter(job => 
        job.title.toLowerCase().includes(lowercasedSearchTerm) ||
        job.location.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [activeJobs, searchTerm]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Find Your Next Opportunity</h1>
        <p className="text-slate-500 mt-1">Browse and apply for jobs at Innovate Inc.</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or location..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-lg px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col sm:flex-row items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-indigo-600">{job.title}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {job.location} <span className="mx-2 text-slate-300">&bull;</span> {job.salary}
                </p>
                <p className="text-sm text-slate-600 mt-3 max-w-2xl line-clamp-2">{job.description}</p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                <button
                  onClick={() => onSelectJob(job.id)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-lg">
            <p className="text-slate-500">No jobs match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;