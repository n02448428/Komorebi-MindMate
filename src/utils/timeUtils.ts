import { hasCompletedTodaysInsight } from './timeUtils';

import { startOfDay, addHours } from 'date-fns';

export interface TimeOfDay {
  period: 'morning' | 'evening' | 'day' | 'night';
  isSessionTime: boolean;
  nextSessionTime?: Date;
  greeting: string;
  shouldAutoStart: boolean;
}

export const getTimeOfDay = (userName?: string): TimeOfDay => {
  const now = new Date();
  const hour = now.getHours();
  
  // Updated session times for clearer boundaries
  const morningStart = 6; // 6 AM
  const eveningStart = 18; // 6 PM (18:00)
  
  let period: 'morning' | 'evening' | 'day' | 'night';
  let isSessionTime = true;
  let nextSessionTime: Date | undefined;
  let greeting: string;
  let shouldAutoStart = true;
  
  // Personalize greeting with user's name
  const personalGreeting = userName ? `, ${userName}` : '';
  
  if (hour >= morningStart && hour < eveningStart) {
    // 6 AM to 6 PM - Morning session period
    period = 'morning';
    greeting = `Good morning${personalGreeting}! I'm here to help you start your day with intention and clarity. What's stirring in your heart as this new day begins?`;
  } else {
    // 6 PM to 6 AM next day - Evening session period
    period = 'evening';
    if (hour >= eveningStart) {
      greeting = `Good evening${personalGreeting}! Welcome to this peaceful moment of reflection. How was your day, and what would you like to explore together?`;
    } else {
      // Early morning hours (12 AM - 6 AM) - still evening session
      greeting = `Hello${personalGreeting}! Even in these quiet nighttime hours, reflection can bring peace and clarity. What's on your mind tonight?`;
    }
  }
  
  return {
    period,
    isSessionTime,
    nextSessionTime,
    greeting,
    shouldAutoStart
  };
};

export const hasCompletedTodaysSession = (
  lastSessionDate?: Date,
  sessionType?: 'morning' | 'evening'
): boolean => {
  if (!lastSessionDate) return false;
  
  const today = startOfDay(new Date());
  const sessionDay = startOfDay(lastSessionDate);
  
  return today.getTime() === sessionDay.getTime();
};

export const hasCompletedTodaysInsight = (
  lastInsightDate?: Date
): boolean => {
  if (!lastInsightDate) return false;
  
  const today = startOfDay(new Date());
  const insightDay = startOfDay(lastInsightDate);
  
  return today.getTime() === insightDay.getTime();
};

export const getNextAvailableSession = (): Date => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 6) {
    // Before 6 AM - next morning session starts at 6 AM today
    return addHours(startOfDay(now), 6);
  } else if (hour < 18) {
    // Between 6 AM and 6 PM - next evening session starts at 6 PM today
    return addHours(startOfDay(now), 18);
  } else {
    // After 6 PM - next morning session starts at 6 AM tomorrow
    return addHours(startOfDay(now), 30); // 6 AM next day
  }
};

export const formatTimeUntilNext = (nextTime: Date): string => {
  const now = new Date();
  const diff = nextTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const getSessionTimeLimit = (isPro: boolean): number => {
  // Return time limit in minutes
  return isPro ? 60 : 15;
};

export const formatSessionTimeRemaining = (startTime: Date, timeLimit: number): string => {
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
  const remaining = Math.max(0, timeLimit - elapsed);
  
  if (remaining === 0) return "Time's up";
  if (remaining < 60) return `${remaining}m remaining`;
  
  const hours = Math.floor(remaining / 60);
  const minutes = remaining % 60;
  return `${hours}h ${minutes}m remaining`;
};