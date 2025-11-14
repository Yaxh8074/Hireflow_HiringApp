
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { usePaygApi } from '../hooks/usePaygApi.ts';
import { useChat } from '../hooks/useChat.ts';
import { getUnreadCounts, markChatAsRead } from '../services/chatService.ts';
import BriefcaseIcon from './icons/BriefcaseIcon.tsx';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';
import type { ChatMessage } from '../types.ts';

interface MessengerProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedChatId: string | null;
}

interface ChatSummary {
    id: string;
    participantName: string;
    jobTitle: string;
    lastMessage: ChatMessage | null;
    isUnread: boolean;
}

const Messenger: React.FC<MessengerProps> = ({ isOpen, onClose, initialSelectedChatId }) => {
    const { user } = useAuth();
    const api = usePaygApi();
    const [selectedChatId, setSelectedChatId] = useState<string | null>(initialSelectedChatId);
    const { messages, sendMessage } = useChat(selectedChatId, user!.id);
    const [newMessage, setNewMessage] = useState('');
    const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const buildChatSummaries = useCallback(() => {
        if (!user || user.role !== 'hiring-manager' || api.isLoading) return;

        const unreadInfo = getUnreadCounts(user.id as 'hm1');

        const summaries = api.applications.map(app => {
            const candidate = api.candidates[app.candidateId];
            const job = api.jobs.find(j => j.id === app.jobId);
            const chatMessages = getMessagesForChat(app.id);
            const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;

            if (candidate && job && lastMessage) { // Only show conversations with messages
                return {
                    id: app.id,
                    participantName: candidate.name,
                    jobTitle: job.title,
                    lastMessage: lastMessage,
                    isUnread: unreadInfo.byChat[app.id] || false,
                };
            }
            return null;
        }).filter((s): s is ChatSummary => s !== null)
          .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));

        setChatSummaries(summaries);
    }, [user, api.isLoading, api.applications, api.candidates, api.jobs]);

    useEffect(() => {
        buildChatSummaries();
        
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'payg_chats' || e.key === 'payg_chats_meta') {
                buildChatSummaries();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [buildChatSummaries]);
    
    useEffect(() => {
        if(initialSelectedChatId) {
            setSelectedChatId(initialSelectedChatId);
        } else if (chatSummaries.length > 0 && !selectedChatId) {
            // Default to selecting the most recent chat if none is selected
            setSelectedChatId(chatSummaries[0].id);
        }
    }, [initialSelectedChatId, chatSummaries, selectedChatId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectChat = (chatId: string) => {
        setSelectedChatId(chatId);
        markChatAsRead(chatId, user!.id);
        // Optimistically update the unread status in the UI
        setChatSummaries(prev => prev.map(s => s.id === chatId ? { ...s, isUnread: false } : s));
    };
    
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };
    
    const selectedChatSummary = useMemo(() => chatSummaries.find(s => s.id === selectedChatId), [chatSummaries, selectedChatId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all">
                <div className="p-4 border-b border-slate-200 flex-shrink-0 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Messenger</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="flex-grow flex overflow-hidden">
                    {/* Left Panel: Chat List */}
                    <div className="w-1/3 border-r border-slate-200 overflow-y-auto">
                        {chatSummaries.map(summary => (
                            <button key={summary.id} onClick={() => handleSelectChat(summary.id)} className={`w-full text-left p-4 border-l-4 transition-colors ${selectedChatId === summary.id ? 'bg-indigo-50 border-indigo-500' : 'border-transparent hover:bg-slate-50'}`}>
                                <div className="flex justify-between items-start">
                                    <p className={`font-semibold text-slate-800 ${summary.isUnread ? 'font-bold' : ''}`}>{summary.participantName}</p>
                                    {summary.isUnread && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></div>}
                                </div>
                                <p className="text-sm text-slate-500 truncate">{summary.jobTitle}</p>
                                <p className={`text-xs text-slate-400 mt-1 truncate ${summary.isUnread ? 'font-semibold text-slate-600' : ''}`}>
                                    {summary.lastMessage?.text}
                                </p>
                            </button>
                        ))}
                    </div>
                    {/* Right Panel: Chat View */}
                    <div className="w-2/3 flex flex-col">
                        {selectedChatSummary ? (
                             <>
                                <div className="p-4 border-b border-slate-200 flex-shrink-0">
                                    <h3 className="font-bold text-slate-900">{selectedChatSummary.participantName}</h3>
                                    <p className="text-sm text-slate-500">{selectedChatSummary.jobTitle}</p>
                                </div>
                                <div className="p-4 flex-grow overflow-y-auto bg-slate-50 space-y-4">
                                    {messages.map((msg) => {
                                        const isSentByMe = msg.senderId === user!.id;
                                        return (
                                            <div key={msg.id} className={`flex items-end gap-2 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isSentByMe ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-slate-200 text-slate-800 rounded-bl-lg'}`}>
                                                    <p className="text-sm">{msg.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 border-t border-slate-200 flex-shrink-0 bg-white">
                                    <form onSubmit={handleSend} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-full shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        <button type="submit" className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors" disabled={!newMessage.trim()}>
                                            <PaperAirplaneIcon className="h-5 w-5" />
                                        </button>
                                    </form>
                                </div>
                             </>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-slate-50">
                                <div className="text-center text-slate-500">
                                    <BriefcaseIcon className="h-12 w-12 mx-auto text-slate-300" />
                                    <p className="mt-2">Select a conversation to start chatting.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function getMessagesForChat(chatId: string): ChatMessage[] {
    try {
        const chatsJson = localStorage.getItem('payg_chats');
        const allChats = chatsJson ? JSON.parse(chatsJson) : {};
        return allChats[chatId] || [];
    } catch (e) {
        return [];
    }
}

export default Messenger;
