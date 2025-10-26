
import React, { useState, useMemo } from 'react';
import type { usePaygApi } from '../hooks/usePaygApi';
import type { Candidate } from '../types';
import { CandidateStatus } from '../types';

interface CandidateDatabaseProps {
  api: ReturnType<typeof usePaygApi>;
}

const statusColors: Record<CandidateStatus, string> = {
  [CandidateStatus.APPLIED]: 'bg-blue-100 text-blue-800',
  [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800',
  [CandidateStatus.INTERVIEW]: 'bg-purple-100 text-purple-800',
  [CandidateStatus.OFFER]: 'bg-pink-100 text-pink-800',
  [CandidateStatus.HIRED]: 'bg-green-100 text-green-800',
};

const CandidateDatabase: React.FC<CandidateDatabaseProps> = ({ api }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'ALL'>('ALL');
  
  const allCandidates = useMemo(() => Object.values(api.candidates), [api.candidates]);

  const filteredCandidates = useMemo(() => {
    return allCandidates.filter(candidate => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allCandidates, searchTerm, statusFilter]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-1">Candidate Database</h1>
      <p className="text-slate-500 mb-6">Search and filter all candidates across all your job postings.</p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or title..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as CandidateStatus | 'ALL')}
          className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="ALL">All Statuses</option>
          {Object.values(CandidateStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-200">
          {filteredCandidates.map(candidate => (
            <li key={candidate.id} className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-indigo-600">{candidate.name}</p>
                  <p className="text-sm text-slate-600 font-medium">{candidate.title}</p>
                  <p className="text-xs text-slate-500 mt-2 max-w-xl">{candidate.summary}</p>
                </div>
                <div className="text-right ml-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[candidate.status]}`}>{candidate.status}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CandidateDatabase;
