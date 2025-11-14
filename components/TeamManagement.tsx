
import React, { useState } from 'react';
import type { usePaygApi } from '../hooks/usePaygApi.ts';
import { useAuth } from '../hooks/useAuth.ts';
import UserPlusIcon from './icons/UserPlusIcon.tsx';
import InviteMemberModal from './InviteMemberModal.tsx';

interface TeamManagementProps {
  api: ReturnType<typeof usePaygApi>;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ api }) => {
  const { user } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const { team, teamMembers, inviteTeamMember, isLoading } = api;
  
  const isAdmin = user?.teamRole === 'Admin';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
              <h1 className="text-3xl font-bold text-slate-900">{team?.name || 'Your Team'}</h1>
              <p className="text-slate-500 mt-1">Manage your team members and their roles.</p>
          </div>
          {isAdmin && (
            <button
                onClick={() => setIsInviteModalOpen(true)}
                className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
                <UserPlusIcon className="h-5 w-5 mr-2 -ml-1" />
                Invite Member
            </button>
          )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {teamMembers.map(member => (
              <li key={member.id} className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${member.teamRole === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'}`}>
                        {member.teamRole}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
      </div>
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={inviteTeamMember}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TeamManagement;