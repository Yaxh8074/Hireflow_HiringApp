
import React, { useState, useEffect, useMemo } from 'react';
import type { Job, Application } from '../../types';
import type { usePaygApi } from '../../hooks/usePaygApi';
import { useAuth } from '../../hooks/useAuth';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import PaperClipIcon from '../icons/PaperClipIcon';

interface CandidateJobDetailProps {
  jobId: string;
  api: ReturnType<typeof usePaygApi>;
  onBack: () => void;
}

const CandidateJobDetail: React.FC<CandidateJobDetailProps> = ({ jobId, api, onBack }) => {
  const [job, setJob] = useState<Job | null>(null);
  const { user } = useAuth();
  const candidateProfile = useMemo(() => user ? api.candidates[user.id] : null, [user, api.candidates]);

  // State for the application form
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<{name: string, data: string} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const selectedJob = api.jobs.find(j => j.id === jobId);
    setJob(selectedJob || null);
  }, [jobId, api.jobs]);

  const application = useMemo<Application | undefined>(() => {
    if (!user || !job) return undefined;
    return api.applications.find(app => app.jobId === job.id && app.candidateId === user.id);
  }, [user, job, api.applications]);
  
  // Pre-populate resume from profile if not yet applied
  useEffect(() => {
    if (candidateProfile && !application) {
        setResumeText(candidateProfile.resumeText || '');
        if (candidateProfile.resumeFileName && candidateProfile.resumeFileData) {
            setResumeFile({ name: candidateProfile.resumeFileName, data: candidateProfile.resumeFileData });
        }
    }
  }, [candidateProfile, application]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        alert('Please upload a valid file type (PDF, DOC, DOCX).');
        e.target.value = ''; // Clear the input
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("File is too large. Please upload a file smaller than 2MB.");
        e.target.value = ''; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
          setResumeFile({ name: file.name, data: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = async () => {
    if (job && user && !application) {
      if (!resumeText && !resumeFile) {
        alert('Please provide your resume by pasting text or uploading a file.');
        return;
      }
      try {
        await api.applyForJob(job.id, user.id, {
            resumeText: resumeText,
            resumeFileName: resumeFile?.name,
            resumeFileData: resumeFile?.data,
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      } catch(e) {
        // error is handled by the hook and displayed globally
      }
    }
  };

  if (api.isLoading && !job) return <div>Loading...</div>;
  if (!job) return <div>Job not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Job Search
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 text-slate-500">{job.location} &bull; {job.salary}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
                onClick={handleApply} 
                disabled={!!application || api.isLoading}
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {application ? 'Applied' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm transition-opacity duration-300">
            Your application for <strong>{job.title}</strong> was submitted successfully!
        </div>
      )}

      {application && !showSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm">
            You applied for this position on {new Date(application.appliedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Your current status is: <strong>{application.status}</strong>.
            {application.resumeFileName && <p className="mt-1">You submitted the resume file: <strong>{application.resumeFileName}</strong>.</p>}
        </div>
      )}

      {!application && (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Submit Your Resume</h2>
              <p className="text-sm text-slate-500 mt-1">
                  Your profile resume has been pre-filled. You can customize it below for this specific application.
              </p>
            </div>
            
            <div>
                 <label htmlFor="resumeText" className="block text-sm font-medium text-slate-700">Paste Resume</label>
                 <textarea id="resumeText" value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={10} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>
            
            <div>
                 <label className="block text-sm font-medium text-slate-700">Or Upload Resume File</label>
                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <PaperClipIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 2MB</p>
                    </div>
                 </div>
                 {resumeFile && (
                    <div className="mt-3 text-sm text-slate-700 flex justify-between items-center bg-slate-100 p-2 rounded-md">
                        <span>{resumeFile.name}</span>
                        <button onClick={() => setResumeFile(null)} className="text-red-500 hover:text-red-700 font-medium">Remove</button>
                    </div>
                 )}
            </div>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Job Description</h2>
        <div className="prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap">{job.description}</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateJobDetail;
