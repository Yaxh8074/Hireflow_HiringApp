
import React, { useState, useEffect, useMemo } from 'react';
import type { Candidate, Job, Application } from '../types.ts';
import { CandidateStatus } from '../types.ts';
import { usePaygApi } from '../hooks/usePaygApi.ts';
import BriefcaseIcon from './icons/BriefcaseIcon.tsx';
import CheckCircleIcon from './icons/CheckCircleIcon.tsx';
import Chat from './Chat.tsx';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon.tsx';
import BookingModal from './candidate/BookingModal.tsx';
import SkillAssessmentModal from './candidate/SkillAssessmentModal.tsx';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon.tsx';

interface CandidatePortalProps {
    applicationId: string;
}

const statusColors: Record<CandidateStatus, string> = {
  [CandidateStatus.APPLIED]: 'bg-blue-100 text-blue-800',
  [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800',
  [CandidateStatus.INTERVIEW]: 'bg-purple-100 text-purple-800',
  [CandidateStatus.OFFER]: 'bg-pink-100 text-pink-800',
  [CandidateStatus.HIRED]: 'bg-green-100 text-green-800',
  [CandidateStatus.WITHDRAWN]: 'bg-slate-100 text-slate-800',
};

const applicationStages = [
    CandidateStatus.APPLIED,
    CandidateStatus.SCREENING,
    CandidateStatus.INTERVIEW,
    CandidateStatus.OFFER,
    CandidateStatus.HIRED,
];

const CandidatePortal: React.FC<CandidatePortalProps> = ({ applicationId }) => {
    const api = usePaygApi();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [job, setJob] = useState<Job | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

    useEffect(() => {
        if (api.applications.length > 0 && Object.keys(api.candidates).length > 0 && api.jobs.length > 0) {
            const foundApplication = api.applications.find(app => app.id === applicationId) || null;
            setApplication(foundApplication);

            if (foundApplication) {
                const foundCandidate = api.candidates[foundApplication.candidateId] || null;
                const foundJob = api.jobs.find(j => j.id === foundApplication.jobId) || null;
                setCandidate(foundCandidate);
                setJob(foundJob);
            }
        }
    }, [applicationId, api.applications, api.candidates, api.jobs]);


    const handleWithdraw = () => {
        if(application && window.confirm("Are you sure you want to withdraw your application? This action cannot be undone.")) {
            api.withdrawApplication(application.id);
        }
    }
    
    const currentStageIndex = useMemo(() => {
        if (!application) return -1;
        return applicationStages.indexOf(application.status);
    }, [application]);


    if (api.isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
         );
    }
    
    if (!candidate || !job || !application) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Application Not Found</h1>
                    <p className="text-slate-500 mt-2">The link may be invalid or the job posting has been removed.</p>
                </div>
            </div>
        )
    }

    const showBookingButton = application.interviewSchedule?.status === 'pending';
    const showConfirmedSlot = application.interviewSchedule?.status === 'booked' && application.interviewSchedule.confirmedSlot;
    const showAssessmentButton = application.skillAssessment?.status === 'pending';
    const showAssessmentResult = application.skillAssessment?.status === 'completed';

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto p-4 flex items-center">
                    <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
                    <span className="ml-3 text-xl font-bold text-slate-800">Innovate Inc.</span>
                </div>
            </header>
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Hello, {candidate.name}</h1>
                    <p className="text-slate-500 mt-1">Here's the current status of your application for the <span className="font-semibold text-indigo-600">{job.title}</span> position.</p>
                    
                    {showAssessmentButton && (
                        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500">
                            <h3 className="font-bold text-yellow-800">Action Required: Complete Your Skill Assessment</h3>
                            <p className="text-sm text-yellow-700 mt-1">Please complete a short skill assessment to proceed with your application.</p>
                            <button 
                                onClick={() => setIsAssessmentModalOpen(true)}
                                className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700"
                            >
                                Take Skill Assessment
                            </button>
                        </div>
                    )}
                    
                    {showBookingButton && (
                        <div className="mt-6 p-4 bg-indigo-50 border-l-4 border-indigo-500">
                            <h3 className="font-bold text-indigo-800">Action Required: Book Your Interview</h3>
                            <p className="text-sm text-indigo-700 mt-1">Please select a time for your interview. Click the button below to see available slots.</p>
                            <button 
                                onClick={() => setIsBookingModalOpen(true)}
                                className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Book Your Interview
                            </button>
                        </div>
                    )}

                     {showConfirmedSlot && (
                        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500">
                            <h3 className="font-bold text-green-800">Interview Confirmed!</h3>
                            <p className="text-sm text-green-700 mt-1">Your interview is scheduled for: <strong>{new Date(application.interviewSchedule.confirmedSlot!).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</strong></p>
                        </div>
                    )}

                    {showAssessmentResult && (
                         <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500">
                            <h3 className="font-bold text-green-800">Skill Assessment Completed!</h3>
                            <p className="text-sm text-green-700 mt-1">You scored: <strong>{(application.skillAssessment!.score! * 100).toFixed(0)}%</strong>. We will review your results and be in touch shortly.</p>
                        </div>
                    )}


                    <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Your Application Status</h2>
                                <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
                            </div>
                            <div className={`mt-3 sm:mt-0 px-3 py-1.5 text-sm font-medium rounded-full ${statusColors[application.status]}`}>
                                {application.status}
                            </div>
                        </div>
                        {application.status === CandidateStatus.WITHDRAWN && (
                            <p className="mt-4 text-sm text-slate-600 bg-slate-100 p-3 rounded-md">You have successfully withdrawn your application. Thank you for your interest.</p>
                        )}
                    </div>
                    
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Application Progress</h3>
                        <div className="flex items-center">
                            {applicationStages.map((stage, index) => (
                                <React.Fragment key={stage}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${index <= currentStageIndex ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                                            {index < currentStageIndex ? <CheckCircleIcon className="w-6 h-6" /> : index + 1}
                                        </div>
                                        <p className={`mt-2 text-xs text-center font-medium ${index <= currentStageIndex ? 'text-indigo-600' : 'text-slate-500'}`}>{stage}</p>
                                    </div>
                                    {index < applicationStages.length - 1 && (
                                        <div className={`flex-1 h-1 ${index < currentStageIndex ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Job Description</h2>
                        <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                            <h3 className="font-bold text-slate-700">{job.title}</h3>
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Salary:</strong> {job.salary}</p>
                            <hr className="my-4" />
                            <p>{job.description}</p>
                        </div>
                    </div>
                     {application.status !== CandidateStatus.WITHDRAWN && application.status !== CandidateStatus.HIRED && (
                        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start justify-center gap-6 text-center">
                            <div>
                                <button
                                    onClick={() => setIsChatOpen(true)}
                                    className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 -ml-1" />
                                    Contact HR
                                </button>
                                <p className="text-xs text-slate-400 mt-2">Have a question about your application?</p>
                            </div>
                            <div>
                                <button
                                    onClick={handleWithdraw}
                                    className="px-5 py-2 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Withdraw Application
                                </button>
                                <p className="text-xs text-slate-400 mt-2">If you are no longer interested.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {job && candidate && (
                <Chat
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    chatId={application.id}
                    chatTitle={`Chat about ${job.title}`}
                    participant={{id: 'hm1', name: 'Innovate Inc. HR'}}
                />
            )}
            {job && application && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    application={application}
                    job={job}
                    api={api}
                />
            )}
            {job && application && application.skillAssessment && (
                <SkillAssessmentModal
                    isOpen={isAssessmentModalOpen}
                    onClose={() => setIsAssessmentModalOpen(false)}
                    application={application}
                    job={job}
                    api={api}
                />
            )}
        </div>
    )
}

export default CandidatePortal;