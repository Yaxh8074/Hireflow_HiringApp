
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { fetchAllCandidates, createUser as apiCreateUser, fetchUserByEmail } from '../services/mockApiService.ts';
import type { User, Candidate } from '../types.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string, rememberMe: boolean, role: 'hiring-manager' | 'candidate') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  signup: (name: string, email: string, pass: string) => Promise<void>;
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
    // Simulate API call and password check
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (pass !== 'password123') {
        setIsLoading(false);
        throw new Error('Invalid email or password.');
    }

    try {
        let userData: User | null = null;
        if (role === 'hiring-manager') {
            const foundUser = await fetchUserByEmail(email);
            if (foundUser) {
                userData = foundUser;
            }
        } else if (role === 'candidate') {
            const foundCandidate = Object.values(mockCandidates || {}).find(c => c.email.toLowerCase() === email.toLowerCase());
            if (foundCandidate) {
                userData = { id: foundCandidate.id, email: foundCandidate.email, name: foundCandidate.name, role: 'candidate' };
            }
        }
        
        if (userData) {
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('authUser', JSON.stringify(userData));
          setUser(userData);
        } else {
          throw new Error('Invalid email or password.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    try {
        // Password is not used in mock service, but would be in a real app
        const newUser = await apiCreateUser(name, email, 'candidate');
        
        // Automatically log the user in upon successful registration
        sessionStorage.setItem('authUser', JSON.stringify(newUser));
        setUser(newUser);
    } catch (error) {
        // Re-throw the error to be caught and displayed in the UI component
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('authUser');
    localStorage.removeItem('authUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, signup }}>
      {children}
    </AuthContext.Provider>
  );
};