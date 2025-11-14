
import React, { useState } from 'react';
import type { Application, Job } from '../../types.ts';
import type { usePaygApi } from '../../hooks/usePaygApi.ts';
import XMarkIcon from '../icons/XMarkIcon.tsx';
import CheckCircleIcon from '../icons/CheckCircleIcon.tsx';

interface SkillAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  job: Job;
  api: ReturnType<typeof usePaygApi>;
}

const SkillAssessmentModal: React.FC<SkillAssessmentModalProps> = ({ isOpen, onClose, application, job, api }) => {
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const questions = application.skillAssessment?.questions;

  if (!isOpen || !questions) {
    return null;
  }

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.length !== questions.length || answers.some(a => a === undefined)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    
    let correctCount = 0;
    questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswerIndex) {
            correctCount++;
        }
    });
    
    const score = correctCount / questions.length;
    setFinalScore(score);

    try {
        await api.updateApplicationState(application.id, {
            skillAssessment: {
                ...application.skillAssessment!,
                status: 'completed',
                answers: answers,
                score: score,
            }
        });
        setIsCompleted(true);
    } catch (error) {
        console.error("Failed to submit assessment", error);
        alert("There was an error submitting your assessment. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    setIsCompleted(false);
    setAnswers([]);
    setFinalScore(0);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Skill Assessment</h2>
              <p className="text-sm text-slate-500 mt-1">For the {job.title} position.</p>
            </div>
            <button onClick={handleCloseAndReset} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="h-6 w-6" /></button>
          </div>
        </div>

        {isCompleted ? (
            <div className="p-8 text-center flex-grow flex flex-col items-center justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="mt-4 text-2xl font-bold text-slate-800">Assessment Submitted!</h3>
                <p className="mt-2 text-slate-600">Thank you for completing the skill assessment.</p>
                <p className="mt-4 text-lg font-semibold">Your Score: <span className="text-indigo-600">{(finalScore * 100).toFixed(0)}%</span></p>
                <p className="text-sm text-slate-500">We will review your results and be in touch soon.</p>
                <button
                  onClick={handleCloseAndReset}
                  className="mt-6 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Close
                </button>
            </div>
        ) : (
            <>
                <div className="p-6 flex-grow overflow-y-auto">
                    {questions.map((q, qIndex) => (
                    <fieldset key={qIndex} className="mb-6">
                        <legend className="text-base font-medium text-slate-900 mb-2">
                        {qIndex + 1}. {q.question}
                        </legend>
                        <div className="space-y-3">
                        {q.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center">
                            <input
                                id={`q${qIndex}-o${oIndex}`}
                                name={`question-${qIndex}`}
                                type="radio"
                                checked={answers[qIndex] === oIndex}
                                onChange={() => handleAnswerChange(qIndex, oIndex)}
                                className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                            />
                            <label htmlFor={`q${qIndex}-o${oIndex}`} className="ml-3 block text-sm text-slate-700">
                                {option}
                            </label>
                            </div>
                        ))}
                        </div>
                    </fieldset>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                    {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default SkillAssessmentModal;
