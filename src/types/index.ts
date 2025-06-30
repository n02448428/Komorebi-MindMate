export interface User {
  id: string;
  email: string;
  // Other properties would come from Supabase Auth
}

export interface Profile {
  id: string;
  email: string;
  name?: string;
  is_pro: boolean;
  created_at?: string;
  updated_at?: string;
  timezone?: string;
  last_session_type?: string;
  preferred_scene?: string;
}

export type TimeOfDayPeriod = 'morning' | 'evening' | 'day' | 'night';

export interface TimeOfDay {
  period: TimeOfDayPeriod;
  isSessionTime: boolean;
  nextSessionTime?: Date;
  greeting: string;
  shouldAutoStart: boolean;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface SessionLimits {
  morningCompleted: boolean;
  eveningCompleted: boolean;
  messagesUsed: number;
  maxMessages: number;
  lastMorningSession?: Date;
  lastEveningSession?: Date;
  lastInsightGeneratedDate?: Date;
}

export type NatureScene = 'ocean' | 'forest' | 'desert' | 'mountain' | 'lake' | 'meadow';

export interface InsightCard {
  id: string;
  quote: string;
  type: 'morning' | 'evening';
  sessionId: string;
  createdAt: Date;
  sceneType: NatureScene;
  videoStillUrl?: string;
  isPinned?: boolean;
}

export interface ArchivedChatSession {
  id: string;
  type: 'morning' | 'evening';
  messages: Message[];
  createdAt: Date;
  sceneType: NatureScene;
  messageCount: number;
  duration: number;
  insightCardId?: string;
  insights?: {
    title: string;
    content: string;
  }[];
}