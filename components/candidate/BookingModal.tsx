
import React, { useState } from 'react';
import type { Application, Job } from '../../types.ts';
import type { usePaygApi } from '../../hooks/usePaygApi.ts';
import XMarkIcon from '../icons/XMarkIcon.tsx';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  job: Job;
  api: ReturnType<typeof usePaygApi>;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, application, job, api }) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen || !application.interviewSchedule || application.interviewSchedule.status !== 'pending') {
    return null;
  }

  const { proposedSlots } = application.interviewSchedule;

  const handleSubmit = async () => {
    if (!selectedSlot) {
        alert("Please select a time slot.");
        return;
    }
    setIsConfirming(true);
    try {
        await api.updateApplicationState(application.id, {
            interviewSchedule: {
                ...application.interviewSchedule!,
                status: 'booked',
                confirmedSlot: selectedSlot,
            }
        });
        onClose();
    } catch (error) {
        console.error("Failed to book interview", error);
        alert("There was an error booking your interview. Please try again.");
    } finally {
        setIsConfirming(false);
    }
  };

  const formatSlot = (isoString: string) => {
    return new Date(isoString).toLocaleString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Book Your Interview</h2>
              <p className="text-sm text-slate-500 mt-1">Select a preferred time slot for the {job.title} position.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="h-6 w-6" /></button>
          </div>

          <fieldset className="mt-6">
            <legend className="text-base font-medium text-slate-900">Available Time Slots</legend>
            <div className="mt-4 space-y-4">
              {proposedSlots.map((slot) => (
                <div key={slot} className="flex items-center">
                  <input
                    id={slot}
                    name="interview-slot"
                    type="radio"
                    checked={selectedSlot === slot}
                    onChange={() => setSelectedSlot(slot)}
                    className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <label htmlFor={slot} className="ml-3 block text-sm font-medium text-slate-700">
                    {formatSlot(slot)}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!selectedSlot || isConfirming}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isConfirming ? 'Confirming...' : 'Confirm Slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;