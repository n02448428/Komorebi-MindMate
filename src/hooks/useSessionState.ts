import { useState, useEffect, useRef } from 'react';
import { Message, SessionLimits } from '../types';
import { aiChatService } from '../lib/supabase';
import { getTimeOfDay } from '../utils/timeUtils';

interface UseSessionStateProps {
  profile: any;
  user: any;
  isGuest: boolean;
  sessionLimits: SessionLimits;
  saveSessionLimits: (limits: SessionLimits) => void;
  storage: {
    get: <T>(key: string, defaultValue: T) => T;
    set: <T>(key: string, value: T) => void;
  };
}

export const useSessionState = ({
  profile,
  user,
  isGuest,
  sessionLimits,
  saveSessionLimits,
  storage
}: UseSessionStateProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [userMessagesSinceLastInsight, setUserMessagesSinceLastInsight] = useState(0);

  const timeOfDay = getTimeOfDay(profile?.name);
  const sessionType = timeOfDay.period === 'morning' ? 'morning' : 'evening';

  useEffect(() => {
    // Load session start time
    const savedStartTime = storage.get('session-start-time', null);
    if (savedStartTime) {
      setSessionStartTime(new Date(typeof savedStartTime === 'string' ? savedStartTime : savedStartTime));
    }

    // Load saved messages for the current session
    const savedMessages = storage.get('current-session-messages', null);
    if (savedMessages) {
      try {
        const parsedMessages = (typeof savedMessages === 'string' ? JSON.parse(savedMessages) : savedMessages).map((msg: any) => ({
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

    // Add initial greeting message if no messages exist
    if (messages.length === 0) {
      const greetingMessage: Message = {
        id: 'greeting',
        content: timeOfDay.greeting,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
    }
  }, [profile?.is_pro, user, isGuest, sessionType]);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      storage.set('current-session-messages', messages);
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const isSessionExpired = profile?.is_pro !== true && sessionStartTime && 
      (new Date().getTime() - sessionStartTime.getTime()) > (15 * 60 * 1000);

    if (isLoading || (profile?.is_pro !== true && sessionLimits.messagesUsed >= sessionLimits.maxMessages) || isSessionExpired) return;

    // Start session timer if not already started
    if (!sessionStartTime) {
      const startTime = new Date();
      setSessionStartTime(startTime);
      storage.set('session-start-time', startTime.toISOString());
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const newMessagesUsed = sessionLimits.messagesUsed + 1;
    const newUserMessagesSinceLastInsight = userMessagesSinceLastInsight + 1;
    
    // Update message counts
    setUserMessagesSinceLastInsight(newUserMessagesSinceLastInsight);
    saveSessionLimits({
      ...sessionLimits,
      messagesUsed: newMessagesUsed,
    });

    try {
      // Convert messages to conversation history format (excluding the greeting message)
      const conversationHistory = messages
        .filter(msg => msg.id !== 'greeting')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Use Supabase AI chat service
      const response = await aiChatService.sendMessage(content, sessionType, conversationHistory, profile?.name);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Let's try again in a moment.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    // Reset to just the greeting message
    const greetingMessage: Message = {
      id: 'greeting',
      content: timeOfDay.greeting,
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([greetingMessage]);
    setUserMessagesSinceLastInsight(0);
    const startTime = new Date();
    setSessionStartTime(startTime);
    storage.set('session-start-time', startTime.toISOString());
    storage.set('current-session-messages', null); // Clear saved messages
    saveSessionLimits({
      ...sessionLimits,
      messagesUsed: 0,
    });
  };

  return {
    messages,
    isLoading,
    sessionStartTime,
    userMessagesSinceLastInsight,
    sessionType,
    handleSendMessage,
    resetSession,
    setUserMessagesSinceLastInsight
  };
};