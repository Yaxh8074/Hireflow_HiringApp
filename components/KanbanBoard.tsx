
import React, { useState } from 'react';
import type { Job } from '../types.ts';
import { CandidateStatus } from '../types.ts';
import type { usePaygApi } from '../hooks/usePaygApi.ts';
import type { CandidateWithApplication } from './JobDetail.tsx';
import CandidateCard from './CandidateCard.tsx';

interface KanbanBoardProps {
  candidatesWithApps: CandidateWithApplication[];
  api: ReturnType<typeof usePaygApi>;
  job: Job;
}

const KANBAN_COLUMNS: CandidateStatus[] = [
    CandidateStatus.APPLIED,
    CandidateStatus.SCREENING,
    CandidateStatus.INTERVIEW,
    CandidateStatus.OFFER,
    CandidateStatus.HIRED,
];

const statusColors: Record<CandidateStatus, string> = {
  [CandidateStatus.APPLIED]: 'border-t-blue-500',
  [CandidateStatus.SCREENING]: 'border-t-yellow-500',
  [CandidateStatus.INTERVIEW]: 'border-t-purple-500',
  [CandidateStatus.OFFER]: 'border-t-pink-500',
  [CandidateStatus.HIRED]: 'border-t-green-500',
  [CandidateStatus.WITHDRAWN]: 'border-t-slate-500',
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ candidatesWithApps, api, job }) => {
    const [dragOverStatus, setDragOverStatus] = useState<CandidateStatus | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: CandidateStatus) => {
        e.preventDefault();
        setDragOverStatus(status);
    };

    const handleDragLeave = () => {
        setDragOverStatus(null);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: CandidateStatus) => {
        e.preventDefault();
        const applicationId = e.dataTransfer.getData('applicationId');
        setDragOverStatus(null);
        if (applicationId) {
            const application = candidatesWithApps.find(c => c.application.id === applicationId)?.application;
            if (application && application.status !== newStatus) {
                await api.updateApplicationState(applicationId, { status: newStatus });
            }
        }
    };
    
    return (
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4">
            {KANBAN_COLUMNS.map(status => {
                const candidatesInColumn = candidatesWithApps.filter(c => c.application.status === status);
                return (
                    <div 
                        key={status}
                        onDragOver={(e) => handleDragOver(e, status)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, status)}
                        className={`w-80 flex-shrink-0 bg-slate-100 rounded-lg transition-colors ${dragOverStatus === status ? 'bg-indigo-100' : ''}`}
                    >
                        <div className={`p-4 border-t-4 ${statusColors[status]} rounded-t-lg`}>
                            <h3 className="font-semibold text-slate-800">{status}</h3>
                            <p className="text-sm text-slate-500">{candidatesInColumn.length} candidate{candidatesInColumn.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="p-4 space-y-4 min-h-[200px]">
                            {candidatesInColumn.map(({ candidate, application }) => (
                                <CandidateCard key={application.id} candidate={candidate} job={job} application={application} api={api} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanBoard;
