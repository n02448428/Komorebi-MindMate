import { startOfDay, addHours } from 'date-fns';

export interface TimeOfDay {
  period: 'morning' | 'evening' | 'day' | 'night';
  isSessionTime: boolean;
  nextSessionTime?: Date;
  greeting: string;
  shouldAutoStart: boolean;
}

export const getTimeOfDay = (): TimeOfDay => {
  const now = new Date();
  const hour = now.getHours();
  
  // Default session times (can be enhanced with sunrise/sunset API)
  const morningStart = 5; // 5 AM
  const morningEnd = 11; // 11 AM
  const eveningStart = 17; // 5 PM
  const eveningEnd = 23; // 11 PM
  const eveningCutoff = 20; // 8 PM - after this, switch to evening even if morning wasn't completed
  
  let period: 'morning' | 'evening' | 'day' | 'night';
  let isSessionTime = true; // Always allow sessions if user hasn't had one today
  let nextSessionTime: Date | undefined;
  let greeting: string;
  let shouldAutoStart = true; // Always auto-start if no session today
  
  if (hour >= morningStart && hour < morningEnd) {
    period = 'morning';
    greeting = "Good morning! I'm here to help you start your day with intention and clarity. What's stirring in your heart as this new day begins?";
  } else if (hour >= morningEnd && hour < eveningStart) {
    // During day, but still allow sessions - prefer morning unless it's late
    period = hour >= 14 ? 'evening' : 'morning'; // After 2 PM, switch to evening mode
    greeting = period === 'morning' 
      ? "Hello! Let's take a mindful moment to set an intention for the rest of your day. What would you like to focus on?"
      : "Good afternoon! Let's pause and reflect together on how your day has been unfolding. What's on your mind?";
  } else if (hour >= eveningStart && hour < eveningEnd) {
    period = 'evening';
    greeting = "Good evening! Welcome to this peaceful moment of reflection. How was your day, and what would you like to explore together?";
  } else {
    // Night time - still allow sessions but prefer evening mode
    period = 'evening';
    greeting = "Hello there! Even in these quiet nighttime hours, reflection can bring peace and clarity. What's on your mind tonight?";
  }
  
  // Special case: if it's late in the day (after 8 PM), force evening session
  if (hour >= eveningCutoff) {
    period = 'evening';
    if (hour >= eveningEnd) {
      greeting = "Good evening! In these quiet hours, let's reflect together on what today has brought you. What would you like to explore?";
    } else {
      greeting = "Good evening! Welcome to this peaceful moment of reflection. How was your day, and what would you like to explore together?";
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