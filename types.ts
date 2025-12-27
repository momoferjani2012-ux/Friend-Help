
export interface DayEntry {
  id: string;
  date: string; // ISO format
  content: string;
  followUps: string[];
  analysis: DayAnalysis;
}

export interface DayAnalysis {
  summary: string;
  happinessScore: number;
  patternInsight?: string;
  advice: string[];
  detectedEmotions: string[];
}

export interface UserPreferences {
  theme: 'dark' | 'pink' | 'gray';
  notificationsEnabled: boolean;
  name: string;
  bio: string;
  avatarUrl?: string;
  avatarColor?: string;
  isLoggedIn: boolean;
  agreedToTerms: boolean;
  email?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}
