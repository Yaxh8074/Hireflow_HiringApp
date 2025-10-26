
import React from 'react';
import BuildingOfficeIcon from './icons/BuildingOfficeIcon';

const CompanyProfile: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-2xl mx-auto text-center">
        <BuildingOfficeIcon className="h-16 w-16 mx-auto text-indigo-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Innovate Inc.</h1>
        <p className="text-slate-500 mb-6">
            This is your company profile page. In a real application, you would be able to manage your company details, user access, and subscription settings here.
        </p>
        <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-800">Account Details</h3>
            <p className="text-sm text-slate-600 mt-2">
                <strong>Account Type:</strong> Pay-As-You-Go<br />
                <strong>Administrator:</strong> hiring.manager@innovate.com
            </p>
        </div>
    </div>
  );
};

export default CompanyProfile;
