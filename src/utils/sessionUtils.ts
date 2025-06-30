import { ArchivedChatSession, Message, NatureScene } from '../types';

export const archiveCurrentSession = (
  sessionId: string,
  sessionType: 'morning' | 'evening',
  messages: Message[],
  sessionStartTime: Date | null,
  currentScene: NatureScene,
  insightId?: string,
  user?: any,
  isGuest?: boolean,
  storage?: {
    get: <T>(key: string, defaultValue: T) => T;
    set: <T>(key: string, value: T) => void;
  }
) => {
  if (!user || messages.length <= 1 || !storage) return; // Skip if no meaningful content
  
  const sessionEndTime = new Date();
  const sessionDuration = sessionStartTime 
    ? Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / (1000 * 60))
    : undefined;

  const archivedSession: ArchivedChatSession = {
    id: sessionId,
    type: sessionType,
    messages: messages.filter(msg => msg.id !== 'greeting'), // Exclude greeting
    createdAt: sessionStartTime || sessionEndTime,
    sceneType: currentScene,
    messageCount: messages.filter(msg => msg.role === 'user').length, // Count only user messages
    duration: sessionDuration || 0,
    insightCardId: insightId, // Link to the insight
  };

  // Save to localStorage
  if (user || isGuest) {
    const existingSessions = storage.get('komorebi-chat-sessions', []);
    const updatedSessions = [...existingSessions, archivedSession];
    
    // Keep only the most recent 50 sessions to prevent localStorage bloat
    if (updatedSessions.length > 50) {
      updatedSessions.splice(0, updatedSessions.length - 50);
    }
    
    storage.set('komorebi-chat-sessions', updatedSessions);
  }
};

export const completeSession = (
  sessionType: 'morning' | 'evening',
  sessionLimits: any,
  saveSessionLimits: (limits: any) => void
) => {
  const now = new Date();
  const updatedLimits = {
    ...sessionLimits,
    messagesUsed: 0,
    [sessionType === 'morning' ? 'lastMorningSession' : 'lastEveningSession']: now,
  };
  saveSessionLimits(updatedLimits);
};