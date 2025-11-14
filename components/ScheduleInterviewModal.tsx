import React, { useState } from 'react';
import type { Application, Candidate, Job } from '../types.ts';
import { ServiceType } from '../types.ts';
import type { usePaygApi } from '../hooks/usePaygApi.ts';
import XMarkIcon from './icons/XMarkIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  candidate: Candidate;
  job: Job;
  api: ReturnType<typeof usePaygApi>;
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ isOpen, onClose, application, candidate, job, api }) => {
  const [slots, setSlots] = useState<string[]>(['']);

  if (!isOpen) return null;

  const handleSlotChange = (index: number, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = value;
    setSlots(newSlots);
  };

  const handleAddSlot = () => {
    setSlots([...slots, '']);
  };

  const handleRemoveSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const proposedSlots = slots.filter(s => s.trim() !== '');
    if (proposedSlots.length === 0) {
      alert('Please propose at least one time slot.');
      return;
    }
    
    try {
      await api.addBillingCharge(ServiceType.INTERVIEW_SCHEDULING, `Interview scheduling for ${candidate.name}`);
      await api.updateApplicationState(application.id, {
        interviewSchedule: {
          status: 'pending',
          proposedSlots: proposedSlots,
        }
      });
      onClose();
    } catch (err) {
      console.error("Failed to schedule interview:", err);
      // The global error handler in usePaygApi will show a message.
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Schedule Interview</h2>
                <p className="text-sm text-slate-500 mt-1">Propose time slots for {candidate.name}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="h-6 w-6" /></button>
          </div>

          <div className="mt-6 space-y-4 max-h-80 overflow-y-auto pr-2">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={slot}
                  onChange={(e) => handleSlotChange(index, e.target.value)}
                  className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  onClick={() => handleRemoveSlot(index)}
                  disabled={slots.length === 1}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-md disabled:text-slate-300 disabled:hover:bg-transparent"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button onClick={handleAddSlot} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add another slot
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={api.isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              Propose Times
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;