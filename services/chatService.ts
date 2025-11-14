
import type { ChatMessage } from '../types.ts';

const CHATS_STORAGE_KEY = 'payg_chats';
const CHATS_META_STORAGE_KEY = 'payg_chats_meta';


const seedInitialChats = () => {
    if (localStorage.getItem(CHATS_STORAGE_KEY)) {
        return;
    }
    const initialChats: Record<string, ChatMessage[]> = {
        'app1': [
            { id: 'msg1', senderId: 'c1', text: 'Hi, I was wondering if there is an update on my application?', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2 },
            { id: 'msg2', senderId: 'hm1', text: 'Hello Alice, thanks for reaching out. We are still reviewing candidates and should have an update for you by the end of the week.', timestamp: Date.now() - 1000 * 60 * 60 * 23 },
            { id: 'msg3', senderId: 'c1', text: 'Great, thank you for the information!', timestamp: Date.now() - 1000 * 60 * 60 * 22 },
        ],
        'app4': [
             { id: 'msg4', senderId: 'c5', text: 'Hello, can you provide more details about the on-call rotation for this role?', timestamp: Date.now() - 1000 * 60 * 60 * 48 }
        ]
    };
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(initialChats));
};

seedInitialChats();

const getChats = (): Record<string, ChatMessage[]> => {
    try {
        const chatsJson = localStorage.getItem(CHATS_STORAGE_KEY);
        return chatsJson ? JSON.parse(chatsJson) : {};
    } catch (e) {
        console.error("Failed to parse chats from localStorage", e);
        return {};
    }
};

const saveChats = (chats: Record<string, ChatMessage[]>) => {
    try {
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
        console.error("Failed to save chats to localStorage", e);
    }
};

// Meta structure: { [chatId: string]: { [userId: string]: { lastRead: number } } }
const getChatMeta = (): Record<string, Record<string, { lastRead: number }>> => {
    try {
        const metaJson = localStorage.getItem(CHATS_META_STORAGE_KEY);
        return metaJson ? JSON.parse(metaJson) : {};
    } catch (e) {
        console.error("Failed to parse chat meta from localStorage", e);
        return {};
    }
};

const saveChatMeta = (meta: Record<string, any>) => {
    try {
        localStorage.setItem(CHATS_META_STORAGE_KEY, JSON.stringify(meta));
    } catch (e) {
        console.error("Failed to save chat meta to localStorage", e);
    }
};

export const markChatAsRead = (chatId: string, userId: string) => {
    const meta = getChatMeta();
    if (!meta[chatId]) {
        meta[chatId] = {};
    }
    const oldTimestamp = meta[chatId][userId]?.lastRead;
    const newTimestamp = Date.now();
    
    // Only update and dispatch event if the timestamp changes, to prevent loops
    if (newTimestamp > (oldTimestamp || 0)) {
        meta[chatId][userId] = { lastRead: newTimestamp };
        saveChatMeta(meta);

        // Dispatch a storage event so other tabs know to update the unread count
        window.dispatchEvent(new StorageEvent('storage', {
            key: CHATS_META_STORAGE_KEY,
            newValue: JSON.stringify(meta),
        }));
    }
};

// This is simplified for the hiring manager ('hm1')
export const getUnreadCounts = (userId: 'hm1'): { total: number, byChat: Record<string, boolean> } => {
    if (userId !== 'hm1') return { total: 0, byChat: {} };

    const allChats = getChats();
    const meta = getChatMeta();
    let total = 0;
    const byChat: Record<string, boolean> = {};

    for (const chatId in allChats) {
        const messages = allChats[chatId];
        if (messages.length === 0) continue;

        const lastMessage = messages[messages.length - 1];
        // Only count as unread if the last message was NOT from the current user
        if (lastMessage.senderId !== userId) {
            const lastReadTimestamp = meta[chatId]?.[userId]?.lastRead || 0;
            if (lastMessage.timestamp > lastReadTimestamp) {
                total++;
                byChat[chatId] = true;
            }
        }
    }
    return { total, byChat };
};


export const getMessagesForChat = (chatId: string): ChatMessage[] => {
    const allChats = getChats();
    return allChats[chatId] || [];
};

export const sendMessage = (chatId: string, senderId: string, text: string): ChatMessage => {
    const allChats = getChats();
    if (!allChats[chatId]) {
        allChats[chatId] = [];
    }
    const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId,
        text,
        timestamp: Date.now(),
    };
    allChats[chatId].push(newMessage);
    saveChats(allChats);
    // Mark as read for the sender immediately
    markChatAsRead(chatId, senderId);
    return newMessage;
};
