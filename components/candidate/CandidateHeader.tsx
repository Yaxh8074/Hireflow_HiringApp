import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ArrowRightOnRectangleIcon from '../icons/ArrowRightOnRectangleIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon';
import type { CandidateView } from '../../types';
import UserCircleIcon from '../icons/UserCircleIcon';

interface CandidateHeaderProps {
  currentView: CandidateView;
  onViewChange: (view: CandidateView) => void;
}

const CandidateHeader: React.FC<CandidateHeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const navItems: { view: CandidateView; label: string }[] = [
    { view: 'job-search', label: 'Job Search' },
    { view: 'my-applications', label: 'My Applications' },
  ];

  const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => (
    <button
      onClick={() => onViewChange(item.view)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        currentView === item.view
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      {item.label}
    </button>
  );

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onViewChange('job-search')}>
               <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
               <span className="ml-2 text-xl font-bold text-slate-800">PAYG Hire</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                {navItems.map((item) => (
                  <NavLink key={item.view} item={item} />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
                 <span className="text-sm text-slate-600 mr-4">Welcome, {user?.name}</span>
                 <button
                    onClick={() => onViewChange('profile')}
                    className={`p-1 rounded-full text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${currentView === 'profile' ? 'text-indigo-600' : ''}`}
                    title="Profile"
                    aria-label="Profile"
                    >
                    <UserCircleIcon className="h-6 w-6" />
                </button>
                 <button
                    onClick={logout}
                    className="p-1 ml-2 rounded-full text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Logout"
                    aria-label="Logout"
                    >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CandidateHeader;