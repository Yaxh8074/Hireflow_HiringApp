
import React, { useState, useEffect, useRef } from 'react';
import type { Candidate, Job, Application } from '../types.ts';
import { CandidateStatus, BackgroundCheckStatus, ServiceType } from '../types.ts';
import type { usePaygApi } from '../hooks/usePaygApi.ts';
import { screenCandidate, generateSkillAssessment } from '../services/geminiService.ts';
import SparklesIcon from './icons/SparklesIcon.tsx';
import EnvelopeIcon from './icons/EnvelopeIcon.tsx';
import PhoneIcon from './icons/PhoneIcon.tsx';
import ShieldCheckIcon from './icons/ShieldCheckIcon.tsx';
import EllipsisVerticalIcon from './icons/EllipsisVerticalIcon.tsx';
import LinkIcon from './icons/LinkIcon.tsx';
import { usePayments } from '../contexts/PaymentContext.tsx';
import BellIcon from './icons/BellIcon.tsx';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon.tsx';
import { useMessenger } from '../contexts/MessengerContext.tsx';
import ScheduleInterviewModal from './ScheduleInterviewModal.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import LightBulbIcon from './icons/LightBulbIcon.tsx';
import { useAuth } from '../hooks/useAuth.ts';


interface CandidateCardProps {
  candidate: Candidate;
  job: Job;
  application: Application;
  api: ReturnType<typeof usePaygApi>;
}

const statusColors: Record<CandidateStatus, string> = {
  [CandidateStatus.APPLIED]: 'bg-blue-100 text-blue-800',
  [CandidateStatus.SCREENING]: 'bg-yellow-100 text-yellow-800',
  [CandidateStatus.INTERVIEW]: 'bg-purple-100 text-purple-800',
  [CandidateStatus.OFFER]: 'bg-pink-100 text-pink-800',
  [CandidateStatus.HIRED]: 'bg-green-100 text-green-800',
  [CandidateStatus.WITHDRAWN]: 'bg-slate-100 text-slate-800',
};

const backgroundCheckColors: Record<BackgroundCheckStatus, string> = {
  [BackgroundCheckStatus.NOT_STARTED]: 'bg-slate-100 text-slate-800',
  [BackgroundCheckStatus.PENDING]: 'bg-yellow-100 text-yellow-800 animate-pulse',
  [BackgroundCheckStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [BackgroundCheckStatus.FLAGGED]: 'bg-red-100 text-red-800',
};

const renderNoteText = (text: string) => {
    const parts = text.split(/(@\w+\s*\w*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('@')) {
            return <strong key={index} className="text-indigo-600 bg-indigo-100 rounded px-1">{part}</strong>;
        }
        return part;
    });
};


const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, job, application, api }) => {
  const [isScreening, setIsScreening] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showResume, setShowResume] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSendingAssessment, setIsSendingAssessment] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { updateCandidateProfile, updateApplicationState, addBillingCharge, addNoteToApplication } = api;
  const { triggerPayment } = usePayments();
  const { openMessenger } = useMessenger();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionsMenuRef]);

  const handleHire = () => {
    triggerPayment(
      {
        service: ServiceType.SUCCESSFUL_HIRE,
        description: `Successful Hire: ${candidate.name} for ${job.title}`,
      },
      async () => {
        await updateApplicationState(application.id, { status: CandidateStatus.HIRED });
        await addBillingCharge(ServiceType.SUCCESSFUL_HIRE, `Successful Hire: ${candidate.name} for ${job.title}`);
      }
    );
  };

  const handleBackgroundCheck = async () => {
    setIsActionsOpen(false);
    try {
      await addBillingCharge(ServiceType.BACKGROUND_CHECK, `Background Check for ${candidate.name}`);
      await updateCandidateProfile(candidate.id, { backgroundCheck: BackgroundCheckStatus.PENDING });
      // Simulate completion
      setTimeout(() => {
        updateCandidateProfile(candidate.id, { backgroundCheck: BackgroundCheckStatus.COMPLETED });
      }, 5000);
    } catch (err) {
      console.error("Failed to order Background Check:", err);
    }
  };

  const handleAiScreening = async () => {
    setIsActionsOpen(false);
    setIsScreening(true);
    try {
      await addBillingCharge(ServiceType.AI_SCREENING, `AI Screening for ${candidate.name}`);
      const result = await screenCandidate(job.description, candidate.summary);
      await updateCandidateProfile(candidate.id, { aiScreeningResult: result });
    } catch (err) {
      console.error("Failed to perform AI Screening:", err);
    }
    finally {
      setIsScreening(false);
    }
  };
  
  const handleSendSkillAssessment = async () => {
    setIsActionsOpen(false);
    setIsSendingAssessment(true);
    try {
        const questions = await generateSkillAssessment(job.description);
        await addBillingCharge(ServiceType.SKILL_ASSESSMENT, `Skill Assessment for ${candidate.name}`);
        await updateApplicationState(application.id, {
            skillAssessment: {
                status: 'pending',
                questions: questions,
            }
        });
    } catch (err) {
        console.error("Failed to send Skill Assessment:", err);
        // Global error handler will catch this
    } finally {
        setIsSendingAssessment(false);
    }
  };
  
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await addNoteToApplication(application.id, newNote.trim());
    setNewNote('');
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/status/${application.id}`;
    navigator.clipboard.writeText(url).then(() => {
        setLinkCopied(true);
        setTimeout(() => {
            setLinkCopied(false);
            setIsActionsOpen(false);
        }, 2000);
    });
  }
  
  const handleToggleResume = () => {
    const newShowResumeState = !showResume;
    setShowResume(newShowResumeState);

    // Only increment view count when opening the resume
    if (newShowResumeState && application.status !== CandidateStatus.WITHDRAWN) {
      updateApplicationState(application.id, { resumeViews: (application.resumeViews || 0) + 1 });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('applicationId', application.id);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  }

  const isHired = application.status === CandidateStatus.HIRED;
  const isWithdrawn = application.status === CandidateStatus.WITHDRAWN;

  const canScheduleInterview = 
    [CandidateStatus.SCREENING, CandidateStatus.INTERVIEW, CandidateStatus.OFFER].includes(application.status) &&
    !application.interviewSchedule;

  return (
    <>
    <div 
        draggable={!isWithdrawn}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-between transition-all duration-200 ease-in-out hover:shadow-md hover:border-indigo-200 ${isWithdrawn ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
             <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[application.status]}`}>{application.status}</span>
        </div>
        <p className="text-sm text-indigo-600 font-medium">{candidate.title}</p>
        <p className="text-sm text-slate-600 mt-3">{candidate.summary}</p>

        <div className="mt-4 flex flex-col space-y-2">
            <div className="flex items-center text-sm text-slate-600">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                <a href={`mailto:${candidate.email}`} title={candidate.email} className="truncate hover:underline">{candidate.email}</a>
            </div>
            <div className="flex items-center text-sm text-slate-600">
                <PhoneIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                <a href={`tel:${candidate.phone}`} title={`Call ${candidate.name}`} className="hover:underline">{candidate.phone}</a>
            </div>
            {application.lastReminderSent && (
                <div className="flex items-center text-xs text-slate-500 pt-1">
                    <BellIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                    <span>Reminder sent: {new Date(application.lastReminderSent).toLocaleDateString()}</span>
                </div>
            )}
            {application.interviewSchedule && (
                <div className="flex items-center text-xs text-slate-500 pt-1">
                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                    <span>
                        {application.interviewSchedule.status === 'booked' && application.interviewSchedule.confirmedSlot
                            ? `Interview: ${new Date(application.interviewSchedule.confirmedSlot).toLocaleDateString([], {
                                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}`
                            : 'Scheduling Pending'}
                    </span>
                </div>
            )}
            {application.skillAssessment && (
                <div className="flex items-center text-xs text-slate-500 pt-1">
                    <LightBulbIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                    <span>
                        Skill Assessment: {application.skillAssessment.status === 'completed' && typeof application.skillAssessment.score === 'number'
                            ? `${(application.skillAssessment.score * 100).toFixed(0)}% (${application.skillAssessment.answers?.filter((ans, i) => ans === application.skillAssessment?.questions[i].correctAnswerIndex).length}/${application.skillAssessment.questions.length})`
                            : 'Pending'}
                    </span>
                </div>
            )}
        </div>

        {candidate.aiScreeningResult && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                <p className="text-sm font-semibold text-indigo-800 flex items-center"><SparklesIcon className="h-4 w-4 mr-2 text-indigo-500" /> AI Screening Summary</p>
                <p className="text-xs text-indigo-700 mt-1">{candidate.aiScreeningResult}</p>
            </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            {(application.resumeText || application.resumeFileData) && (
              <div>
                <button onClick={handleToggleResume} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  {showResume ? 'Hide' : 'View'} Submitted Resume
                </button>
                {showResume && (
                  <div className="mt-2 p-3 bg-slate-50 border rounded-md max-h-48 overflow-y-auto">
                    {application.resumeFileData && application.resumeFileName && (
                      <a 
                        href={application.resumeFileData} 
                        download={application.resumeFileName} 
                        className="block mb-2 text-sm font-medium text-indigo-700 hover:underline"
                      >
                        Download Resume ({application.resumeFileName})
                      </a>
                    )}
                    {application.resumeText && (
                      <pre className="text-xs whitespace-pre-wrap font-mono text-slate-700">
                        {application.resumeText}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isWithdrawn && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Team Notes</label>
                <div className="space-y-3">
                    {application.notes && application.notes.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto space-y-3 pr-2">
                        {application.notes.map(note => (
                            <div key={note.id} className="text-xs">
                                <p className="font-semibold text-slate-800">{note.authorName} <span className="text-slate-400 font-normal ml-1">{new Date(note.timestamp).toLocaleString()}</span></p>
                                <p className="text-slate-600">{renderNoteText(note.text)}</p>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400">No notes yet.</p>
                    )}
                    <form onSubmit={handleAddNote}>
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={2}
                          className="mt-2 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Add a new note. Use @ to mention team members..."
                        />
                        <button 
                          type="submit"
                          disabled={api.isLoading || !newNote.trim()}
                          className="mt-2 text-xs px-3 py-1.5 border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                        >
                          Add Note
                        </button>
                    </form>
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700 flex items-center">
            <ShieldCheckIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
            Background Check:
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${backgroundCheckColors[candidate.backgroundCheck]}`}>{candidate.backgroundCheck}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isHired && !isWithdrawn && (
            <button onClick={handleHire} disabled={api.isLoading} className="flex-grow w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors">
                Hire {candidate.name.split(' ')[0]}
            </button>
          )}

          {!isWithdrawn && (
            <>
            <button 
                onClick={() => openMessenger(application.id)}
                className="p-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md disabled:opacity-50 transition-colors"
                aria-label="Chat with candidate"
                title="Chat with candidate"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
              </button>
            <div className="relative flex-shrink-0" ref={actionsMenuRef}>
              <button 
                onClick={() => setIsActionsOpen(!isActionsOpen)} 
                className="p-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md disabled:opacity-50 transition-colors"
                aria-label="More actions"
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
              {isActionsOpen && (
                <div className="origin-top-right absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button onClick={handleCopyLink} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                        <LinkIcon className="h-4 w-4 mr-3" />
                        {linkCopied ? 'Copied!' : 'Copy Status Link'}
                    </button>
                    {canScheduleInterview && (
                         <button
                            onClick={() => {setIsScheduleModalOpen(true); setIsActionsOpen(false);}}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                            <CalendarDaysIcon className="h-4 w-4 mr-3" />
                            Schedule Interview
                        </button>
                    )}
                    {!candidate.aiScreeningResult && (
                      <button onClick={handleAiScreening} disabled={isScreening || api.isLoading} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                        <SparklesIcon className="h-4 w-4 mr-3" />
                        {isScreening ? 'Screening...' : 'AI Screen'}
                      </button>
                    )}
                    {!application.skillAssessment && (
                        <button onClick={handleSendSkillAssessment} disabled={isSendingAssessment || api.isLoading} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                            <LightBulbIcon className="h-4 w-4 mr-3" />
                            {isSendingAssessment ? 'Generating...' : 'Send Skill Assessment'}
                        </button>
                    )}
                    {candidate.backgroundCheck === BackgroundCheckStatus.NOT_STARTED && !isHired && (
                      <button onClick={handleBackgroundCheck} disabled={api.isLoading} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                        <ShieldCheckIcon className="h-4 w-4 mr-3" />
                        Order BGC
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
    <ScheduleInterviewModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        application={application}
        candidate={candidate}
        job={job}
        api={api}
    />
    </>
  );
};

export default CandidateCard;
