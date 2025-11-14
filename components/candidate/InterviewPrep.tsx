
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import type { usePaygApi } from '../../hooks/usePaygApi.ts';
import { CandidateStatus, type Job, type ChatMessage } from '../../types.ts';
import { generateInterviewContinuation, getInterviewFeedback } from '../../services/geminiService.ts';
import MicrophoneIcon from '../icons/MicrophoneIcon.tsx';
import SparklesIcon from '../icons/SparklesIcon.tsx';
import PaperAirplaneIcon from '../icons/PaperAirplaneIcon.tsx';

interface InterviewPrepProps {
    api: ReturnType<typeof usePaygApi>;
}

const InterviewPrep: React.FC<InterviewPrepProps> = ({ api }) => {
    const { user } = useAuth();
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [transcript, setTranscript] = useState<ChatMessage[]>([]);
    const [feedback, setFeedback] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'interviewing' | 'feedback'>('idle');
    const [isLoading, setIsLoading] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const practiceJobs = useMemo(() => {
        if (!user) return [];
        const jobsById = new Map(api.jobs.map(job => [job.id, job]));
        return api.applications
            .filter(app => app.candidateId === user.id && app.status !== CandidateStatus.WITHDRAWN)
            .map(app => jobsById.get(app.jobId))
            .filter((job): job is Job => !!job);
    }, [api.applications, api.jobs, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, isLoading]);

    const handleStart = async () => {
        if (!selectedJobId) {
            alert('Please select a job to practice for.');
            return;
        }
        const job = practiceJobs.find(j => j.id === selectedJobId);
        if (!job) return;

        setStatus('interviewing');
        setIsLoading(true);
        const firstQuestion = await generateInterviewContinuation([], job.description);
        setTranscript([{ id: 'ai1', senderId: 'ai', text: firstQuestion, timestamp: Date.now() }]);
        setIsLoading(false);
    };

    const handleSubmitAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentAnswer.trim() || isLoading) return;

        const job = practiceJobs.find(j => j.id === selectedJobId);
        if (!job) return;

        const userAnswer: ChatMessage = { id: `user${transcript.length}`, senderId: 'user', text: currentAnswer, timestamp: Date.now() };
        const newTranscript = [...transcript, userAnswer];
        setTranscript(newTranscript);
        setCurrentAnswer('');
        setIsLoading(true);

        const nextQuestion = await generateInterviewContinuation(newTranscript, job.description);
        setTranscript(prev => [...prev, { id: `ai${prev.length}`, senderId: 'ai', text: nextQuestion, timestamp: Date.now() }]);
        setIsLoading(false);
    };
    
    const handleGetFeedback = async () => {
        const job = practiceJobs.find(j => j.id === selectedJobId);
        if (!job) return;
        
        setIsLoading(true);
        const finalFeedback = await getInterviewFeedback(transcript, job.description);
        setFeedback(finalFeedback);
        setStatus('feedback');
        setIsLoading(false);
    };
    
    const handleStartOver = () => {
        setStatus('idle');
        setSelectedJobId('');
        setTranscript([]);
        setFeedback('');
    };
    
    const renderFeedback = (text: string) => {
        const parts = text.split(/What Went Well:|Areas for Improvement:/).filter(p => p.trim() !== '');
        const headings = text.match(/What Went Well:|Areas for Improvement:/g) || [];

        return (
             <div className="space-y-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {headings.map((heading, index) => (
                    <div key={index}>
                        <h4 className="font-bold text-slate-800 text-base mb-2">{heading}</h4>
                        <p>{parts[index]?.trim()}</p>
                    </div>
                ))}
            </div>
        )
    }

    const renderContent = () => {
        if (status === 'idle') {
            return (
                <div className="text-center">
                    <MicrophoneIcon className="h-16 w-16 mx-auto text-indigo-300" />
                    <h2 className="mt-4 text-2xl font-bold text-slate-900">Practice Interview</h2>
                    <p className="mt-2 text-slate-500">Select one of your applications and practice your interview answers with our AI.</p>
                    <div className="mt-6 max-w-xs mx-auto">
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="" disabled>Select a job...</option>
                            {practiceJobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
                        </select>
                    </div>
                    {practiceJobs.length > 0 ? (
                        <button
                            onClick={handleStart}
                            disabled={!selectedJobId}
                            className="mt-4 inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                        >
                            Start Practice Session
                        </button>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500 bg-slate-100 p-3 rounded-md">You haven't applied for any jobs yet. Apply for a job to start practicing.</p>
                    )}
                </div>
            );
        }
        
        if (status === 'interviewing') {
            return (
                <div className="flex flex-col h-full">
                    <div className="p-4 flex-grow overflow-y-auto bg-slate-50 space-y-4">
                        {transcript.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === 'ai' ? '' : 'justify-end'}`}>
                                {msg.senderId === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="w-5 h-5"/></div>}
                                <div className={`max-w-md p-3 rounded-2xl ${msg.senderId === 'ai' ? 'bg-indigo-100 text-indigo-900 rounded-bl-lg' : 'bg-slate-800 text-white rounded-br-lg'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="w-5 h-5"/></div>
                                <div className="max-w-md p-3 rounded-2xl bg-indigo-100 text-indigo-900 rounded-bl-lg">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-slate-200 flex-shrink-0 space-y-3">
                        <form onSubmit={handleSubmitAnswer} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                placeholder="Type your answer..."
                                className="flex-grow block w-full px-4 py-2 bg-white border border-slate-300 rounded-full shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                            />
                            <button type="submit" className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-400" disabled={!currentAnswer.trim() || isLoading}>
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </form>
                         <button onClick={handleGetFeedback} disabled={isLoading} className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-slate-400">
                            End Interview & Get Feedback
                        </button>
                    </div>
                </div>
            );
        }
        
        if (status === 'feedback') {
             return (
                <div className="text-center max-w-2xl mx-auto">
                    <SparklesIcon className="h-16 w-16 mx-auto text-green-400" />
                    <h2 className="mt-4 text-2xl font-bold text-slate-900">Interview Feedback</h2>
                    <p className="mt-2 text-slate-500">Here's a summary of your performance based on your answers.</p>
                    <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-left">
                        {isLoading ? <p>Generating feedback...</p> : renderFeedback(feedback)}
                    </div>
                     <button
                        onClick={handleStartOver}
                        className="mt-6 inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Practice Again
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            {renderContent()}
        </div>
    );
};

export default InterviewPrep;
