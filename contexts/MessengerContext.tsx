import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
// FIX: Corrected the import path for the useAuth hook.
import { useAuth } from '../hooks/useAuth.ts';
import { getUnreadCounts, markChatAsRead } from '../services/chatService.ts';
import Messenger from '../components/Messenger.tsx';

interface MessengerContextType {
    openMessenger: (initialChatId?: string) => void;
    closeMessenger: () => void;
    unreadCount: number;
}

const MessengerContext = createContext<MessengerContextType | undefined>(undefined);

export const useMessenger = () => {
    const context = useContext(MessengerContext);
    if (!context) {
        throw new Error('useMessenger must be used within a MessengerProvider');
    }
    return context;
};

export const MessengerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [initialChatId, setInitialChatId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    const calculateUnread = useCallback(() => {
        if (user?.role === 'hiring-manager') {
            // The user ID 'hm1' is hardcoded for this demo app
            const counts = getUnreadCounts(user.id as 'hm1');
            setUnreadCount(counts.total);
        }
    }, [user]);

    useEffect(() => {
        calculateUnread();
        
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'payg_chats' || e.key === 'payg_chats_meta') {
                calculateUnread();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [calculateUnread]);

    const openMessenger = (chatId?: string) => {
        if (chatId) {
            setInitialChatId(chatId);
            if (user?.id) {
                markChatAsRead(chatId, user.id);
                calculateUnread();
            }
        } else {
            setInitialChatId(null);
        }
        setIsOpen(true);
    };

    const closeMessenger = () => {
        setIsOpen(false);
        setInitialChatId(null);
    };

    return (
        <MessengerContext.Provider value={{ openMessenger, closeMessenger, unreadCount }}>
            {children}
            {isOpen && <Messenger isOpen={isOpen} onClose={closeMessenger} initialSelectedChatId={initialChatId} />}
        </MessengerContext.Provider>
    );
};