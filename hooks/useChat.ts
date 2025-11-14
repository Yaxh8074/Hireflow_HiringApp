
import { useState, useEffect, useCallback } from 'react';
import { getMessagesForChat, sendMessage as apiSendMessage } from '../services/chatService.ts';
import type { ChatMessage } from '../types.ts';

const CHATS_STORAGE_KEY = 'payg_chats';

export const useChat = (chatId: string | null, currentUserId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const loadMessages = useCallback(() => {
    if (chatId) {
      const chatMessages = getMessagesForChat(chatId);
      setMessages(chatMessages);
    } else {
      setMessages([]);
    }
  }, [chatId]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Listen for storage events to update chat in real-time across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHATS_STORAGE_KEY && event.newValue) {
        // We can parse the new value and find the specific chat
        // to avoid re-rendering all open chat components.
        // For simplicity here, we just reload.
        loadMessages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadMessages]);

  const sendMessage = (text: string) => {
    if (!chatId || !text.trim()) return;
    
    apiSendMessage(chatId, currentUserId, text.trim());
    
    // Manually update state for the current tab, as the 'storage' event
    // doesn't fire for the tab that made the change.
    loadMessages();
  };

  return { messages, sendMessage };
};
