
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import BriefcaseIcon from './icons/BriefcaseIcon.tsx';
import EyeIcon from './icons/EyeIcon.tsx';
import EyeSlashIcon from './icons/EyeSlashIcon.tsx';
import UserGroupIcon from './icons/UserGroupIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<'hiring-manager' | 'candidate'>('hiring-manager');
  const [email, setEmail] = useState('hiring.manager@innovate.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();

  const handleRoleChange = (newRole: 'hiring-manager' | 'candidate') => {
    setRole(newRole);
    setError(null);
    if (newRole === 'hiring-manager') {
      setEmail('hiring.manager@innovate.com');
    } else {
      setEmail('candidate@example.com');
    }
    setPassword('password123');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      await login(email, password, rememberMe, role);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
            <div className="text-center mb-6">
                <BriefcaseIcon className="h-12 w-12 text-indigo-600 mx-auto" />
                <h1 className="text-3xl font-bold text-slate-800 mt-2">PAYG Hire</h1>
                <p className="text-slate-500">Log in to your account</p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg mb-6">
                <button 
                    onClick={() => handleRoleChange('hiring-manager')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center justify-center transition-colors ${role === 'hiring-manager' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Hiring Manager
                </button>
                 <button 
                    onClick={() => handleRoleChange('candidate')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center justify-center transition-colors ${role === 'candidate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                    <UsersIcon className="h-5 w-5 mr-2" />
                    Candidate
                </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                <input
                type="email"
                id="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900"
                required
                />
            </div>
            <div>
                <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900"
                    required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-slate-500" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-slate-500" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                    Remember me
                </label>
                </div>
            </div>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">
                <p>{error}</p>
                </div>
            )}
            <div>
                <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
                >
                {isLoggingIn ? 'Logging In...' : 'Log In'}
                </button>
            </div>
            </form>
        </div>

         <div className="mt-4 p-4 bg-slate-100 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
            <p className="font-semibold">Demo credentials for {role === 'hiring-manager' ? 'Hiring Manager' : 'Candidate'}:</p>
            {role === 'hiring-manager' ? (
                <>
                    <p>Email: <strong className="text-slate-700">hiring.manager@innovate.com</strong></p>
                    <p>Password: <strong className="text-slate-700">password123</strong></p>
                </>
            ) : (
                <>
                    <p>Email: <strong className="text-slate-700">candidate@example.com</strong></p>
                    <p>Password: <strong className="text-slate-700">password123</strong></p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;