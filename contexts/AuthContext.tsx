import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string, rememberMe: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user on initial load, prioritizing localStorage
    setIsLoading(true);
    try {
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
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.toLowerCase() === 'hiring.manager@innovate.com' && pass === 'password123') {
          const userData: User = { email, name: 'Hiring Manager' };
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

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            const userData: User = { email: 'sundar.pichai@google.com', name: 'Sundar Pichai' };
            // Social logins are typically persistent
            localStorage.setItem('authUser', JSON.stringify(userData));
            setUser(userData);
            setIsLoading(false);
            resolve();
        }, 1000);
    });
  };

  const logout = () => {
    sessionStorage.removeItem('authUser');
    localStorage.removeItem('authUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};