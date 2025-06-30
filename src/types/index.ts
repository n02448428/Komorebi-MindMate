export interface User {
  id: string;
  email: string;
  name?: string;
  isPro: boolean;
  createdAt: Date;
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