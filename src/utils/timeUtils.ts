import { format, isAfter, isBefore, startOfDay, addHours } from 'date-fns';

export interface TimeOfDay {
  period: 'morning' | 'evening' | 'day' | 'night';
  isSessionTime: boolean;
  nextSessionTime?: Date;
  greeting: string;
  shouldAutoStart: boolean;
}

export const getTimeOfDay = (userLocation?: { lat: number; lng: number }): TimeOfDay => {
  const now = new Date();
  const hour = now.getHours();
  
  // Default session times (can be enhanced with sunrise/sunset API)
  const morningStart = 5; // 5 AM
  const morningEnd = 11; // 11 AM
  const eveningStart = 17; // 5 PM
  const eveningEnd = 23; // 11 PM
  const eveningCutoff = 20; // 8 PM - after this, switch to evening even if morning wasn't completed
  
  let period: 'morning' | 'evening' | 'day' | 'night';
  let isSessionTime = false;
  let nextSessionTime: Date | undefined;
  let greeting: string;
  let shouldAutoStart = false;
  
  if (hour >= morningStart && hour < morningEnd) {
    period = 'morning';
    isSessionTime = true;
    shouldAutoStart = true;
    greeting = "Good morning. Let's set a beautiful intention for today.";
  } else if (hour >= morningEnd && hour < eveningStart) {
    period = 'day';
    isSessionTime = false;
    nextSessionTime = addHours(startOfDay(now), eveningStart);
    greeting = "Your evening reflection will be available at 5 PM.";
  } else if (hour >= eveningStart && hour < eveningEnd) {
    period = 'evening';
    isSessionTime = true;
    shouldAutoStart = true;
    greeting = "Welcome back. Let's reflect on your day together.";
  } else {
    period = 'night';
    isSessionTime = false;
    nextSessionTime = addHours(startOfDay(now), morningStart + 24);
    greeting = "Rest well. Your morning session will be available at 5 AM.";
  }
  
  // Special case: if it's late in the day (after 8 PM), force evening session
  if (hour >= eveningCutoff) {
    if (period === 'morning' || period === 'day') {
      period = 'evening';
      isSessionTime = true;
      shouldAutoStart = true;
      greeting = "It's getting late. Let's reflect on your day together.";
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
  sessionType: 'morning' | 'evening',
  lastSessionDate?: Date
): boolean => {
  if (!lastSessionDate) return false;
  
  const today = startOfDay(new Date());
  const sessionDay = startOfDay(lastSessionDate);
  
  return today.getTime() === sessionDay.getTime();
};

export const getNextAvailableSession = (): Date => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 5) {
    // Before morning session
    return addHours(startOfDay(now), 5);
  } else if (hour < 17) {
    // Before evening session
    return addHours(startOfDay(now), 17);
  } else {
    // After evening session, next morning
    return addHours(startOfDay(now), 29); // 5 AM next day
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