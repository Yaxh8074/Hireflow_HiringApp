
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { fetchAllCandidates } from '../services/mockApiService.ts';
import type { User, Candidate } from '../types.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string, rememberMe: boolean, role: 'hiring-manager' | 'candidate') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

let mockCandidates: Record<string, Candidate> | null = null;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDataAndCheckAuth = async () => {
      setIsLoading(true);
      try {
        // Pre-load candidates for login check
        mockCandidates = await fetchAllCandidates();

        // Check for a logged-in user on initial load
        const rememberedUser = localStorage.getItem('authUser');
        const sessionUser = sessionStorage.getItem('authUser');

        if (rememberedUser) {
          setUser(JSON.parse(rememberedUser));
        } else if (sessionUser) {
          setUser(JSON.parse(sessionUser));
        }
      } catch (error) {
        console.error("Failed to parse user from storage", error);
        sessionStorage.removeItem('authUser');
        localStorage.removeItem('authUser');
      } finally {
          setIsLoading(false);
      }
    };
    
    loadDataAndCheckAuth();
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean, role: 'hiring-manager' | 'candidate'): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let userData: User | null = null;

        if (role === 'hiring-manager' && email.toLowerCase() === 'hiring.manager@innovate.com' && pass === 'password123') {
          userData = { id: 'hm1', email, name: 'Hiring Manager', role: 'hiring-manager' };
        } else if (role === 'candidate' && pass === 'password123') {
            // Check against pre-loaded mock candidates
            const foundCandidate = Object.values(mockCandidates || {}).find(c => c.email.toLowerCase() === email.toLowerCase());
            if (foundCandidate) {
                userData = { id: foundCandidate.id, email: foundCandidate.email, name: foundCandidate.name, role: 'candidate' };
            }
        }
        
        if (userData) {
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('authUser', JSON.stringify(userData));
          setUser(userData);
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error('Invalid email or password.'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    sessionStorage.removeItem('authUser');
    localStorage.removeItem('authUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};