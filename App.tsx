
import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import JobList from './components/JobList';
import JobDetail from './components/JobDetail';
import JobPostForm from './components/JobPostForm';
import BillingSummary from './components/BillingSummary';
import Marketplace from './components/Marketplace';
import CandidateDatabase from './components/CandidateDatabase';
import CompanyProfile from './components/CompanyProfile';
import { usePaygApi } from './hooks/usePaygApi';
import type { View, Job } from './types';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';

const MainAppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const api = usePaygApi();

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setSelectedJobId(null);
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentView('job-detail');
  };

  const handleJobPosted = (newJob: Job) => {
    handleSelectJob(newJob.id);
  };
  
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard api={api} onViewChange={handleViewChange} onSelectJob={handleSelectJob} />;
      case 'jobs':
        return <JobList jobs={api.jobs} onSelectJob={handleSelectJob} onViewChange={handleViewChange} />;
      case 'job-detail':
        if (selectedJobId) {
            return <JobDetail jobId={selectedJobId} api={api} onBack={() => handleViewChange('jobs')} />;
        }
        return <JobList jobs={api.jobs} onSelectJob={handleSelectJob} onViewChange={handleViewChange} />;
      case 'new-job':
        return <JobPostForm api={api} onJobPosted={handleJobPosted} />;
      case 'billing':
        return <BillingSummary billingItems={api.billingItems} />;
      case 'marketplace':
        return <Marketplace api={api} />;
      case 'candidates':
        return <CandidateDatabase api={api} />;
       case 'company-profile':
        return <CompanyProfile />;
      default:
        return <Dashboard api={api} onViewChange={handleViewChange} onSelectJob={handleSelectJob} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header currentView={currentView} onViewChange={handleViewChange} />
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


const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
     return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
     );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MainAppLayout />;
};

export default App;
