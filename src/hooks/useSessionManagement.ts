/**
 * Custom hook for optimized session management
 * Performance: Centralized session logic, reduced prop drilling, memoized calculations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Message, SessionLimits, ArchivedChatSession, NatureScene } from '../types';
import { getTimeOfDay, hasCompletedTodaysSession, getSessionTimeLimit } from '../utils/timeUtils';
import { useStorageArray, useOptimizedStorage } from './useOptimizedStorage';
import { STORAGE_KEYS } from '../utils/storageUtils';

export const useSessionManagement = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionStartTime, setSessionStartTime] = useOptimizedStorage<string | null>(
    STORAGE_KEYS.SESSION_START_TIME, 
    null
  );
  
  // Session limits with optimized storage
  const [sessionLimits, setSessionLimits] = useOptimizedStorage<SessionLimits>(
    STORAGE_KEYS.SESSION_LIMITS,
    {
      morningCompleted: false,
      eveningCompleted: false,
      messagesUsed: 0,
      maxMessages: 4
    }
  );

  // Archive management
  const { items: archivedSessions, addItem: addArchivedSession } = useStorageArray<ArchivedChatSession>(
    STORAGE_KEYS.CHAT_SESSIONS,
    50 // Limit to 50 sessions to prevent storage bloat
  );

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

  // Update session limits when user changes
  useEffect(() => {
    if (user) {
      setSessionLimits(prev => ({
        ...prev,
        maxMessages: user.isPro ? 999 : 4
      }));
    }
  }, [user?.isPro, setSessionLimits]);

  // Initialize greeting message
  useEffect(() => {
    if (messages.length === 0) {
      const greetingMessage: Message = {
        id: 'greeting',
        content: timeOfDay.greeting,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
    }
  }, [messages.length, timeOfDay.greeting]);

  // Start session
  const startSession = useCallback(() => {
    const startTime = new Date();
    setSessionStartTime(startTime.toISOString());
  }, [setSessionStartTime]);

  // Add message to conversation
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Update session limits
  const updateSessionLimits = useCallback((updates: Partial<SessionLimits>) => {
    setSessionLimits(prev => ({ ...prev, ...updates }));
  }, [setSessionLimits]);

  // Archive current session
  const archiveCurrentSession = useCallback((sceneType: NatureScene) => {
    if (!user || messages.length <= 1) return; // Skip if no meaningful content

    const sessionEndTime = new Date();
    const sessionDuration = parsedSessionStartTime 
      ? Math.round((sessionEndTime.getTime() - parsedSessionStartTime.getTime()) / (1000 * 60))
      : undefined;

    const archivedSession: ArchivedChatSession = {
      id: Date.now().toString(),
      type: sessionType,
      messages: messages.filter(msg => msg.id !== 'greeting'),
      createdAt: parsedSessionStartTime || sessionEndTime,
      sceneType,
      messageCount: messages.filter(msg => msg.role === 'user').length,
      duration: sessionDuration,
    };

    addArchivedSession(archivedSession);
  }, [user, messages, parsedSessionStartTime, sessionType, addArchivedSession]);

  // Reset session
  const resetSession = useCallback((sceneType?: NatureScene) => {
    // Archive current session before resetting
    if (sceneType) {
      archiveCurrentSession(sceneType);
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
    setSessionStartTime(new Date().toISOString());
    updateSessionLimits({ messagesUsed: 0 });
  }, [archiveCurrentSession, timeOfDay.greeting, setSessionStartTime, updateSessionLimits]);

  return {
    // State
    messages,
    sessionLimits,
    parsedSessionStartTime,
    archivedSessions,
    
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