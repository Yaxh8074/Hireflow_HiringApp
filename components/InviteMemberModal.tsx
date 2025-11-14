
import React, { useState } from 'react';
import XMarkIcon from './icons/XMarkIcon.tsx';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
  isLoading: boolean;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, onInvite, isLoading }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    try {
        await onInvite(email);
        onClose(); // Close modal on success
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred.');
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Invite Team Member</h2>
              <p className="text-sm text-slate-500 mt-1">They will receive an email with instructions to join.</p>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="h-6 w-6" /></button>
          </div>

          <div className="mt-6">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="name@company.com"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isLoading ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteMemberModal;