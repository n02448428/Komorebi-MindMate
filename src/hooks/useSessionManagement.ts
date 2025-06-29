/**
 * Custom hook for optimized session management
 * Centralizes logic for managing chat sessions, persistence, and state
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Message, SessionLimits, ArchivedChatSession, NatureScene, InsightCard } from '../types';
import { getTimeOfDay, hasCompletedTodaysSession, getSessionTimeLimit } from '../utils/timeUtils';

export const useSessionManagement = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Session limits with optimized storage
  const [sessionLimits, setSessionLimits] = useState<SessionLimits>({
    morningCompleted: false,
    eveningCompleted: false,
    messagesUsed: 0,
    maxMessages: user?.isPro ? 999 : 4
  });

  // Memoized calculations to prevent recalculation
  const timeOfDay = useMemo(() => getTimeOfDay(user?.name), [user?.name]);
  const sessionType = useMemo(() => 
    timeOfDay.period === 'morning' ? 'morning' : 'evening' as const,
    [timeOfDay.period]
  );
  const sessionTimeLimit = useMemo(() => 
    getSessionTimeLimit(user?.isPro || false),
    [user?.isPro]
  );

  // Parse session start time
  const parsedSessionStartTime = useMemo(() => 
    sessionStartTime ? new Date(sessionStartTime) : null,
    [sessionStartTime]
  );

  // Check session completion status
  const hasCompletedBothToday = useMemo(() => {
    if (!user) return false;
    return (
      hasCompletedTodaysSession(sessionLimits.lastMorningSession ? new Date(sessionLimits.lastMorningSession) : undefined) &&
      hasCompletedTodaysSession(sessionLimits.lastEveningSession ? new Date(sessionLimits.lastEveningSession) : undefined)
    );
  }, [user, sessionLimits.lastMorningSession, sessionLimits.lastEveningSession]);

  // Check if session has expired
  const isSessionExpired = useMemo(() => {
    if (user?.isPro || !parsedSessionStartTime) return false;
    return (new Date().getTime() - parsedSessionStartTime.getTime()) > (sessionTimeLimit * 60 * 1000);
  }, [user?.isPro, parsedSessionStartTime, sessionTimeLimit]);

  // Load saved session data
  useEffect(() => {
    // Update session limits based on user status
    if (user) {
      const savedLimits = localStorage.getItem('session-limits');
      if (savedLimits) {
        try {
          const parsed = JSON.parse(savedLimits);
          setSessionLimits({
            ...parsed,
            lastMorningSession: parsed.lastMorningSession ? parsed.lastMorningSession : undefined,
            lastEveningSession: parsed.lastEveningSession ? parsed.lastEveningSession : undefined,
            maxMessages: user?.isPro ? 999 : 4
          });
        } catch (error) {
          console.error('Error parsing session limits:', error);
        }
      }
    } else {
      // Reset limits for non-logged in users
      setSessionLimits({
        morningCompleted: false,
        eveningCompleted: false,
        messagesUsed: 0,
        maxMessages: 4
      });
    }

    // Load session start time
    const savedStartTime = localStorage.getItem('session-start-time');
    if (savedStartTime) {
      try {
        setSessionStartTime(new Date(savedStartTime));
      } catch (error) {
        console.error('Error parsing session start time:', error);
      }
    }

    // Load saved messages
    const savedMessages = localStorage.getItem('current-session-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        if (parsedMessages.length > 0) {
          setMessages(parsedMessages);
          return; // Skip adding greeting if we restored messages
        }
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }

    // Initialize with greeting if no messages
    if (messages.length === 0) {
      const greetingMessage: Message = {
        id: 'greeting',
        content: timeOfDay.greeting,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
    }
  }, [user, user?.isPro, timeOfDay.greeting]);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('current-session-messages', JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }
  }, [messages]);

  // Start session
  const startSession = useCallback(() => {
    const startTime = new Date();
    setSessionStartTime(startTime);
    localStorage.setItem('session-start-time', startTime.toISOString());
  }, []);

  // Add message to conversation
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Update session limits
  const updateSessionLimits = useCallback((updates: Partial<SessionLimits>) => {
    setSessionLimits(prev => {
      const updated = { ...prev, ...updates };
      if (user) {
        localStorage.setItem('session-limits', JSON.stringify(updated));
      }
      return updated;
    });
  }, [user]);

  // Archive current session
  const archiveCurrentSession = useCallback((
    sessionId: string, 
    sceneType: NatureScene, 
    insightId?: string
  ) => {
    if (!user || messages.length <= 1) return; // Skip if no meaningful content

    const sessionEndTime = new Date();
    const sessionDuration = parsedSessionStartTime 
      ? Math.round((sessionEndTime.getTime() - parsedSessionStartTime.getTime()) / (1000 * 60))
      : undefined;

    const archivedSession: ArchivedChatSession = {
      id: sessionId,
      type: sessionType,
      messages: messages.filter(msg => msg.id !== 'greeting'),
      createdAt: parsedSessionStartTime || sessionEndTime,
      sceneType,
      messageCount: messages.filter(msg => msg.role === 'user').length,
      duration: sessionDuration || 0,
      insightCardId: insightId,
    };

    try {
      // Save to localStorage
      const existingSessions = JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]');
      existingSessions.push(archivedSession);
      
      // Keep only the most recent 50 sessions to prevent localStorage bloat
      if (existingSessions.length > 50) {
        existingSessions.splice(0, existingSessions.length - 50);
      }
      
      localStorage.setItem('komorebi-chat-sessions', JSON.stringify(existingSessions));
    } catch (error) {
      console.error('Error archiving session:', error);
    }
  }, [user, messages, parsedSessionStartTime, sessionType]);

  // Reset session
  const resetSession = useCallback((sceneType?: NatureScene) => {
    // Archive current session before resetting if we have a scene type
    if (sceneType && messages.length > 1) {
      archiveCurrentSession(Date.now().toString(), sceneType);
    }

    // Reset messages to just greeting
    const greetingMessage: Message = {
      id: 'greeting',
      content: timeOfDay.greeting,
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([greetingMessage]);

    // Reset session tracking
    const startTime = new Date();
    setSessionStartTime(startTime);
    localStorage.setItem('session-start-time', startTime.toISOString());
    localStorage.removeItem('current-session-messages'); // Clear saved messages
    updateSessionLimits({ messagesUsed: 0 });
  }, [archiveCurrentSession, timeOfDay.greeting, updateSessionLimits]);

  return {
    // State
    messages,
    sessionLimits,
    sessionStartTime: parsedSessionStartTime,
    
    // Computed values
    timeOfDay,
    sessionType,
    sessionTimeLimit,
    hasCompletedBothToday,
    isSessionExpired,
    
    // Actions
    addMessage,
    updateSessionLimits,
    startSession,
    resetSession,
    archiveCurrentSession,
    
    // Setters for direct access when needed
    setMessages
  };
};

export default useSessionManagement;