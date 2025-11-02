import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import BriefcaseIcon from './icons/BriefcaseIcon';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';
import GoogleIcon from './icons/GoogleIcon';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('hiring.manager@innovate.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      await login(email, password, rememberMe);
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

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
        await loginWithGoogle();
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
        setIsLoggingIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-slate-200">
        <div className="text-center mb-8">
            <BriefcaseIcon className="h-12 w-12 text-indigo-600 mx-auto" />
            <h1 className="text-3xl font-bold text-slate-800 mt-2">PAYG Hire</h1>
            <p className="text-slate-500">Log in to your account</p>
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
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">OR</span>
            </div>
        </div>

        <div>
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                <GoogleIcon className="h-5 w-5 mr-3" />
                Sign in with Google
            </button>
        </div>

         <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
            <p className="font-semibold">Demo credentials:</p>
            <p>Email: <strong className="text-slate-700">hiring.manager@innovate.com</strong></p>
            <p>Password: <strong className="text-slate-700">password123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;