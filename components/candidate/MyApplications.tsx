
import React, { useMemo, useState } from 'react';
import type { usePaygApi } from '../../hooks/usePaygApi.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import type { CandidateStatus, Job, Application } from '../../types.ts';
import EyeIcon from '../icons/EyeIcon.tsx';
import Chat from '../Chat.tsx';
import BookingModal from './BookingModal.tsx';
import CalendarDaysIcon from '../icons/CalendarDaysIcon.tsx';
import SkillAssessmentModal from './SkillAssessmentModal.tsx';
import ClipboardDocumentCheckIcon from '../icons/ClipboardDocumentCheckIcon.tsx';

interface MyApplicationsProps {
  api: ReturnType<typeof usePaygApi>;
  onSelectJob: (jobId: string) => void;
}

const statusColors: Record<CandidateStatus, string> = {
    'Applied': 'bg-blue-100 text-blue-800',
    'Screening': 'bg-yellow-100 text-yellow-800',
    'Interviewing': 'bg-purple-100 text-purple-800',
    'Offer': 'bg-pink-100 text-pink-800',
    'Hired': 'bg-green-100 text-green-800',
    'Withdrawn': 'bg-slate-100 text-slate-800',
};

interface ApplicationWithJob extends Application {
    job: Job;
}

const MyApplications: React.FC<MyApplicationsProps> = ({ api, onSelectJob }) => {
    const { user } = useAuth();
    const [activeChat, setActiveChat] = useState<{appId: string, jobTitle: string} | null>(null);
    const [appToBook, setAppToBook] = useState<ApplicationWithJob | null>(null);
    const [appToAssess, setAppToAssess] = useState<ApplicationWithJob | null>(null);

    const myApplications = useMemo((): ApplicationWithJob[] => {
        if (!user) return [];
        
        const jobsById = new Map(api.jobs.map(job => [job.id, job]));

        return api.applications
            .filter(app => app.candidateId === user.id)
            .map(app => {
                const job = jobsById.get(app.jobId);
                return job ? { ...app, job } : null;
            })
            .filter((app): app is ApplicationWithJob => app !== null)
            .sort((a,b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    }, [api.applications, api.jobs, user]);

    const handleWithdraw = (applicationId: string, jobTitle: string) => {
        if (window.confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) {
            api.withdrawApplication(applicationId);
        }
    }
    
    const handleOpenChat = (app: ApplicationWithJob) => {
        setActiveChat({ appId: app.id, jobTitle: app.job.title });
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
                <p className="text-slate-500 mt-1">Track the status of jobs you've applied for.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <ul className="divide-y divide-slate-200">
                    {myApplications.length > 0 ? (
                        myApplications.map(app => (
                            <li key={app.id} className="p-6">
                                <div className="flex flex-col sm:flex-row items-start justify-between">
                                    <div className="flex-grow">
                                        <p className="text-lg font-semibold text-indigo-600">{app.job.title}</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {app.job.location} <span className="mx-2 text-slate-300">&bull;</span> Applied on {new Date(app.appliedDate).toLocaleDateString()}
                                        </p>
                                        <div className="mt-2 flex items-center text-xs text-slate-500">
                                            <EyeIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                                            <span>{app.resumeViews || 0} resume view{app.resumeViews === 1 ? '' : 's'}</span>
                                        </div>
                                        {app.interviewSchedule?.status === 'booked' && app.interviewSchedule.confirmedSlot && (
                                            <div className="mt-2 flex items-center text-xs font-semibold text-green-700 bg-green-100 py-1 px-2 rounded-full w-fit">
                                                <CalendarDaysIcon className="h-4 w-4 mr-1.5" />
                                                <span>Interview Confirmed: {new Date(app.interviewSchedule.confirmedSlot).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                            </div>
                                        )}
                                        {app.skillAssessment?.status === 'completed' && typeof app.skillAssessment.score === 'number' && (
                                            <div className="mt-2 flex items-center text-xs font-semibold text-green-700 bg-green-100 py-1 px-2 rounded-full w-fit">
                                                <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1.5" />
                                                <span>Assessment Score: {(app.skillAssessment.score * 100).toFixed(0)}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 flex flex-col items-start sm:items-end gap-2">
                                        <div className='flex items-center gap-4'>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[app.status]}`}>{app.status}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                        {app.skillAssessment?.status === 'pending' && (
                                            <button onClick={() => setAppToAssess(app)} className="text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-md">
                                                Take Skill Assessment
                                            </button>
                                        )}
                                        {app.interviewSchedule?.status === 'pending' && (
                                            <button onClick={() => setAppToBook(app)} className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md">
                                                Book Your Interview
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleOpenChat(app)}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            Contact HR
                                        </button>
                                        <button
                                            onClick={() => onSelectJob(app.job.id)}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            View Job
                                        </button>
                                        {app.status !== 'Withdrawn' && app.status !== 'Hired' && (
                                            <button
                                                onClick={() => handleWithdraw(app.id, app.job.title)}
                                                className="text-sm font-medium text-red-600 hover:text-red-500"
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="p-10 text-center text-slate-500">
                            You haven't applied for any jobs yet.
                        </li>
                    )}
                </ul>
            </div>
             {activeChat && user && (
                <Chat 
                    isOpen={!!activeChat} 
                    onClose={() => setActiveChat(null)} 
                    chatId={activeChat.appId}
                    chatTitle={`Chat about ${activeChat.jobTitle}`}
                    participant={{id: 'hm1', name: 'Innovate Inc. HR'}}
                />
            )}
            {appToBook && (
                <BookingModal
                    isOpen={!!appToBook}
                    onClose={() => setAppToBook(null)}
                    application={appToBook}
                    job={appToBook.job}
                    api={api}
                />
            )}
            {appToAssess && (
                <SkillAssessmentModal
                    isOpen={!!appToAssess}
                    onClose={() => setAppToAssess(null)}
                    application={appToAssess}
                    job={appToAssess.job}
                    api={api}
                />
            )}
        </div>
    );
};

export default MyApplications;