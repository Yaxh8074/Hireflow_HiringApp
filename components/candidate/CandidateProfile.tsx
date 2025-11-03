
import React, { useState, useEffect } from 'react';
import type { usePaygApi } from '../../hooks/usePaygApi.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import type { Candidate } from '../../types.ts';
import PaperClipIcon from '../icons/PaperClipIcon.tsx';

interface CandidateProfileProps {
    api: ReturnType<typeof usePaygApi>;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({ api }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Partial<Candidate>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (user && api.candidates[user.id]) {
            setProfile(api.candidates[user.id]);
        }
    }, [user, api.candidates]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

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
              setProfile(prev => ({ 
                  ...prev, 
                  resumeFileName: file.name, 
                  resumeFileData: reader.result as string 
              }));
          };
          reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setProfile(prev => ({
            ...prev,
            resumeFileName: null,
            resumeFileData: null,
        }));
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await api.updateCandidateProfile(user.id, profile);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3s
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Your Profile</h1>
            <p className="text-slate-500 mb-6">Keep your information up-to-date for hiring managers.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input type="text" id="name" name="name" value={profile.name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Professional Title</label>
                        <input type="text" id="title" name="title" value={profile.title || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
                        <input type="tel" id="phone" name="phone" value={profile.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                        <input type="text" id="location" name="location" value={profile.location || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-slate-700">Professional Summary</label>
                    <textarea id="summary" name="summary" value={profile.summary || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
                
                <div>
                    <label htmlFor="resumeText" className="block text-sm font-medium text-slate-700">Resume Details (Paste Text)</label>
                    <p className="text-xs text-slate-500 mb-1">Paste your full resume here, including work experience, education, and skills.</p>
                    <textarea id="resumeText" name="resumeText" value={profile.resumeText || ''} onChange={handleChange} rows={15} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Or Upload Resume File</label>
                    {profile.resumeFileData && profile.resumeFileName ? (
                        <div className="mt-2 flex items-center justify-between rounded-md border border-slate-300 bg-slate-50 p-3">
                            <p className="truncate text-sm font-medium text-slate-700">{profile.resumeFileName}</p>
                            <div className="ml-4 flex flex-shrink-0 items-center space-x-4">
                                <a
                                    href={profile.resumeFileData}
                                    download={profile.resumeFileName}
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Download
                                </a>
                                <span className="text-slate-300" aria-hidden="true">|</span>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="font-medium text-red-600 hover:text-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-slate-300 px-6 pt-5 pb-6">
                            <div className="space-y-1 text-center">
                                <PaperClipIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                    >
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 2MB</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end items-center gap-4">
                    {saveSuccess && (
                        <span className="text-sm text-green-600">Profile saved successfully!</span>
                    )}
                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CandidateProfile;