import { format, isAfter, isBefore, startOfDay, addHours } from 'date-fns';

export interface TimeOfDay {
  period: 'morning' | 'evening' | 'day' | 'night';
  isSessionTime: boolean;
  nextSessionTime?: Date;
  greeting: string;
}

export const getTimeOfDay = (userLocation?: { lat: number; lng: number }): TimeOfDay => {
  const now = new Date();
  const hour = now.getHours();
  
  // Default session times (can be enhanced with sunrise/sunset API)
  const morningStart = 5; // 5 AM
  const morningEnd = 11; // 11 AM
  const eveningStart = 17; // 5 PM
  const eveningEnd = 23; // 11 PM
  
  let period: 'morning' | 'evening' | 'day' | 'night';
  let isSessionTime = false;
  let nextSessionTime: Date | undefined;
  let greeting: string;
  
  if (hour >= morningStart && hour < morningEnd) {
    period = 'morning';
    isSessionTime = true;
    greeting = "Good morning. Let's set a beautiful intention for today.";
  } else if (hour >= morningEnd && hour < eveningStart) {
    period = 'day';
    isSessionTime = false;
    nextSessionTime = addHours(startOfDay(now), eveningStart);
    greeting = "Your evening reflection will be available at 5 PM.";
  } else if (hour >= eveningStart && hour < eveningEnd) {
    period = 'evening';
    isSessionTime = true;
    greeting = "Welcome back. Let's reflect on your day together.";
  } else {
    period = 'night';
    isSessionTime = false;
    nextSessionTime = addHours(startOfDay(now), morningStart + 24);
    greeting = "Rest well. Your morning session will be available at 5 AM.";
  }
  
  return {
    period,
    isSessionTime,
    nextSessionTime,
    greeting
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