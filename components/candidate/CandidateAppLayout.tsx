
import React, { useState } from 'react';
import { usePaygApi } from '../../hooks/usePaygApi.ts';
import CandidateHeader from './CandidateHeader.tsx';
import JobSearch from './JobSearch.tsx';
import MyApplications from './MyApplications.tsx';
import CandidateJobDetail from './CandidateJobDetail.tsx';
import type { CandidateView } from '../../types.ts';
import CandidateProfile from './CandidateProfile.tsx';

const CandidateAppLayout: React.FC = () => {
    const [currentView, setCurrentView] = useState<CandidateView>('job-search');
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const api = usePaygApi();

    const handleViewChange = (view: CandidateView) => {
        setCurrentView(view);
        setSelectedJobId(null);
    };

    const handleSelectJob = (jobId: string) => {
        setSelectedJobId(jobId);
        setCurrentView('job-detail');
    };
    
    const renderContent = () => {
        switch (currentView) {
            case 'job-search':
                return <JobSearch api={api} onSelectJob={handleSelectJob} />;
            case 'my-applications':
                return <MyApplications api={api} onSelectJob={handleSelectJob} />;
            case 'job-detail':
                if (selectedJobId) {
                    return <CandidateJobDetail jobId={selectedJobId} api={api} onBack={() => handleViewChange('job-search')} />
                }
                return <JobSearch api={api} onSelectJob={handleSelectJob} />;
            case 'profile':
                return <CandidateProfile api={api} />;
            default:
                return <JobSearch api={api} onSelectJob={handleSelectJob} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <CandidateHeader currentView={currentView} onViewChange={handleViewChange} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {api.isLoading && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                )}
                {api.error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{api.error}</span>
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
};

export default CandidateAppLayout;