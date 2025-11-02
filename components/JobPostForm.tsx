import React, { useState } from 'react';
import type { Job } from '../types';
import { JobStatus } from '../types';
import type { usePaygApi } from '../hooks/usePaygApi';
import { generateJobDescription } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import PlusIcon from './icons/PlusIcon';

interface JobPostFormProps {
  api: ReturnType<typeof usePaygApi>;
  onJobPosted: (newJob: Job) => void;
}

const JobPostForm: React.FC<JobPostFormProps> = ({ api, onJobPosted }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [keywords, setKeywords] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!title || !keywords) {
      alert('Please fill in Job Title and Key Responsibilities before generating.');
      return;
    }
    setIsGenerating(true);
    const generatedDesc = await generateJobDescription(title, keywords);
    setDescription(generatedDesc);
    setIsGenerating(false);
  };

  const handleSubmit = async (status: JobStatus) => {
    if (!title || !location || !description) {
      alert('Please fill all required fields.');
      return;
    }
    const newJob = await api.postJob({ title, location, salary, description, status });
    if(newJob) {
      onJobPosted(newJob);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create a New Job Post</h1>
        <p className="text-slate-500 mb-6">
            Fill in the details below. Publishing a job will incur a one-time posting fee.
            {api.isDiscountActive && <span className="block font-semibold text-indigo-600">Your 90% new member discount will be applied!</span>}
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">Job Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                </div>
                 <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                    <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                </div>
            </div>

            <div>
                <label htmlFor="salary" className="block text-sm font-medium text-slate-700">Salary Range (Optional)</label>
                <input type="text" id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-slate-700">Key Responsibilities / Keywords</label>
                <p className="text-xs text-slate-500 mb-1">Enter a few comma-separated keywords for the AI to build upon.</p>
                <textarea id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., build UI components, manage state, collaborate with designers"></textarea>
            </div>
            
            <div>
                 <div className="flex justify-between items-center mb-1">
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700">Full Job Description</label>
                    <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating || api.isLoading}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                        <SparklesIcon className={`-ml-0.5 mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                </div>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={10} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required></textarea>
            </div>
            
            <div className="flex justify-end space-x-4">
                <button 
                    type="button"
                    onClick={() => handleSubmit(JobStatus.DRAFT)}
                    disabled={api.isLoading}
                    className="inline-flex items-center justify-center px-6 py-2 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 disabled:bg-slate-200"
                >
                    Save Draft
                </button>
                <button 
                    type="button"
                    onClick={() => handleSubmit(JobStatus.ACTIVE)}
                    disabled={api.isLoading}
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Publish Job
                </button>
            </div>
        </form>
    </div>
  );
};

export default JobPostForm;