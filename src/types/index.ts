export interface User {
  id: string;
  email: string;
  name?: string;
  isPro: boolean;
  createdAt: Date;
  subscriptionStatus?: 'active' | 'inactive' | 'trial';
  timezone?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  type: 'morning' | 'evening';
  messages: Message[];
  insightCard?: InsightCard;
  createdAt: Date;
  completed: boolean;
  sceneType: NatureScene;
  startTime?: Date;
  endTime?: Date;
}

export interface InsightCard {
  id: string;
  quote: string;
  type: 'morning' | 'evening';
  sessionId: string;
  createdAt: Date;
  shared?: boolean;
  sceneType: NatureScene;
  imageUrl?: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  cardNumber?: string;
}

export interface AIResponse {
  message: string;
  isComplete: boolean;
  insightCard?: {
    quote: string;
  };
  nextPrompt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export type NatureScene = 'ocean' | 'forest' | 'desert' | 'mountain' | 'lake' | 'meadow';

export interface SessionLimits {
  morningCompleted: boolean;
  eveningCompleted: boolean;
  lastMorningSession?: Date;
  lastEveningSession?: Date;
  messagesUsed: number;
  maxMessages: number;
  sessionStartTime?: Date;
}

export interface TimeOfDay {
  period: 'morning' | 'evening' | 'day' | 'night';
  isSessionTime: boolean;
  nextSessionTime?: Date;
  greeting: string;
  shouldAutoStart: boolean;
}