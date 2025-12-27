
import { DayEntry, UserPreferences, ChatMessage, ChatSession } from './types';

const STORAGE_KEY = 'friend_help_ai_data';
const PREFS_KEY = 'friend_help_ai_prefs';
const CHAT_SESSIONS_KEY = 'friend_help_ai_sessions';

const encrypt = (data: string) => btoa(data);
const decrypt = (data: string) => atob(data);

export const saveEntries = (entries: DayEntry[]) => {
  localStorage.setItem(STORAGE_KEY, encrypt(JSON.stringify(entries)));
};

export const getEntries = (): DayEntry[] => {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return [];
  try { return JSON.parse(decrypt(encrypted)); } catch { return []; }
};

export const savePreferences = (prefs: UserPreferences) => {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
};

export const getPreferences = (): UserPreferences => {
  const data = localStorage.getItem(PREFS_KEY);
  if (!data) return { 
    theme: 'dark', 
    notificationsEnabled: true, 
    name: '', 
    bio: '',
    isLoggedIn: false,
    agreedToTerms: false
  };
  return JSON.parse(data);
};

export const saveChatSessions = (sessions: ChatSession[]) => {
  localStorage.setItem(CHAT_SESSIONS_KEY, encrypt(JSON.stringify(sessions)));
};

export const getChatSessions = (): ChatSession[] => {
  const encrypted = localStorage.getItem(CHAT_SESSIONS_KEY);
  if (!encrypted) return [];
  try { return JSON.parse(decrypt(encrypted)); } catch { return []; }
};

export const clearAllData = () => {
  localStorage.clear();
};
