import React from 'react';
import type { Job, View, ServiceType, Candidate, Application } from '../types';
import { CandidateStatus, JobStatus } from '../types';
import type { usePaygApi } from '../hooks/usePaygApi';
import BriefcaseIcon from './icons/BriefcaseIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';

interface DashboardProps {
  api: ReturnType<typeof usePaygApi>;
  onViewChange: (view: View) => void;
  onSelectJob: (jobId: string) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, actionText?: string, onAction?: () => void }> = ({ icon, title, value, actionText, onAction }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col">
        <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
                <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
                    <dd className="text-3xl font-bold text-slate-900">{value}</dd>
                </dl>
            </div>
        </div>
        {actionText && onAction && (
             <div className="mt-4 pt-4 border-t border-slate-100">
                <button onClick={onAction} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    {actionText} &rarr;
                </button>
            </div>
        )}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ api, onViewChange, onSelectJob }) => {
  const totalCost = api.billingItems.reduce((sum, item) => sum + item.amount, 0);
  const totalCandidates = Object.keys(api.candidates).length;
  const hiredApplications = api.applications.filter(app => app.status === CandidateStatus.HIRED);
  const costPerHire = hiredApplications.length > 0 ? totalCost / hiredApplications.length : 0;
  
  const applicationsByJob = api.applications.reduce((acc, app) => {
    if (!acc[app.jobId]) {
      acc[app.jobId] = [];
    }
    acc[app.jobId].push(app);
    return acc;
  }, {} as Record<string, Application[]>);

  // FIX: Explicitly type the initial value for the accumulator to resolve type inference issues with reduce.
  const costBreakdown = api.billingItems.reduce((acc: Record<string, number>, item) => {
    acc[item.service] = (acc[item.service] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  
  const recentJobs = api.jobs.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">Welcome back! Here's your hiring overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            icon={<CurrencyDollarIcon className="h-6 w-6 text-white"/>} 
            title="Total Spend" 
            value={formatCurrency(totalCost)}
            actionText="View billing details"
            onAction={() => onViewChange('billing')}
        />
        <StatCard 
            icon={<BriefcaseIcon className="h-6 w-6 text-white"/>} 
            title="Active Jobs" 
            value={api.jobs.filter(j => j.status === JobStatus.ACTIVE).length}
            actionText="Manage jobs"
            onAction={() => onViewChange('jobs')}
        />
        <StatCard 
            icon={<UserGroupIcon className="h-6 w-6 text-white"/>} 
            title="Total Candidates" 
            value={totalCandidates}
            actionText="View all candidates"
            onAction={() => onViewChange('candidates')}
        />
        <StatCard 
            icon={<CurrencyDollarIcon className="h-6 w-6 text-white"/>} 
            title="Cost Per Hire" 
            value={formatCurrency(costPerHire)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Job Postings</h2>
            {recentJobs.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                    {recentJobs.map(job => (
                        <li key={job.id} className="py-4 flex items-center justify-between">
                            <div>
                                <p className="text-md font-medium text-indigo-600 truncate">{job.title}</p>
                                <p className="text-sm text-slate-500">{job.location} &bull; {applicationsByJob[job.id]?.length || 0} candidates</p>
                            </div>
                            <button 
                                onClick={() => onSelectJob(job.id)}
                                className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                View
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8">
                    <p className="text-slate-500">You haven't posted any jobs yet.</p>
                    <button
                        onClick={() => onViewChange('new-job')}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Post Your First Job
                    </button>
                </div>
            )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Spend by Category</h2>
            <ul className="space-y-3">
                {Object.entries(costBreakdown).map(([service, amount]) => (
                    <li key={service} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">{service}</span>
                        {/* FIX: Cast `amount` to number as TypeScript may infer it as 'unknown' from Object.entries. */}
                        <span className="font-medium text-slate-800">{formatCurrency(amount as number)}</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;