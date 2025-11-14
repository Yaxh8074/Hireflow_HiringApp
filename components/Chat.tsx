
import React, { useState, useEffect, useRef } from 'react';
import BriefcaseIcon from './icons/BriefcaseIcon.tsx';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { useChat } from '../hooks/useChat.ts';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatTitle: string;
  participant: { id: string, name: string };
}

const Chat: React.FC<ChatProps> = ({ isOpen, onClose, chatId, chatTitle, participant }) => {
  const { user } = useAuth();
  const { messages, sendMessage } = useChat(isOpen ? chatId : null, user!.id);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        // Scroll to bottom when modal opens or messages update
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[80vh] flex flex-col transform transition-all">
        <div className="p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {participant.name}
                </h2>
                <p className="text-sm text-slate-500">{chatTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>
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

        <div className="p-4 border-t border-slate-200 flex-shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow block w-full px-3 py-2 bg-white border border-slate-300 rounded-full shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    autoFocus
                />
                <button type="submit" className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors" disabled={!newMessage.trim()}>
                    <PaperAirplaneIcon className="h-5 w-5" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
