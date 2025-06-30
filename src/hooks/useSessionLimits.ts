import { useState, useEffect } from 'react';
import { SessionLimits } from '../types';

interface UseSessionLimitsProps {
  user: any;
  isGuest: boolean;
  profile: any;
  storage: {
    get: <T>(key: string, defaultValue: T) => T;
    set: <T>(key: string, value: T) => void;
  };
}

export const useSessionLimits = ({ user, isGuest, profile, storage }: UseSessionLimitsProps) => {
  const [sessionLimits, setSessionLimits] = useState<SessionLimits>({
    morningCompleted: false,
    eveningCompleted: false,
    messagesUsed: 0,
    maxMessages: profile?.is_pro === true ? 999 : 4,
  });

  useEffect(() => {
    // Load session limits from localStorage only if user is logged in
    if (user || isGuest) {
      const savedLimits = storage.get('session-limits', null);
      if (savedLimits) {
        const parsed = typeof savedLimits === 'string' ? JSON.parse(savedLimits) : savedLimits;
        setSessionLimits({
          ...parsed,
          lastMorningSession: parsed.lastMorningSession ? new Date(parsed.lastMorningSession) : undefined,
          lastEveningSession: parsed.lastEveningSession ? new Date(parsed.lastEveningSession) : undefined,
          maxMessages: profile?.is_pro === true ? 999 : 4,
        });
      }
    } else {
      // Reset session limits for non-logged in users
      setSessionLimits({
        morningCompleted: false,
        eveningCompleted: false,
        messagesUsed: 0,
        maxMessages: 4,
      });
    }
  }, [profile?.is_pro, user, isGuest]);

  const saveSessionLimits = (limits: SessionLimits) => {
    setSessionLimits(limits);
    // Only save to localStorage if user is logged in
    if (user || isGuest) {
      storage.set('session-limits', limits);
    }
  };

  return {
    sessionLimits,
    saveSessionLimits
  };
};