// Time utilities
export function getTimeOfDay(userName?: string) {
  const hour = new Date().getHours();
  const personalGreeting = userName ? `, ${userName}` : '';
  
  if (hour >= 6 && hour < 18) {
    return {
      period: 'morning' as const,
      isSessionTime: true,
      greeting: `Good morning${personalGreeting}! I'm here to help you start your day with intention and clarity. What's stirring in your heart as this new day begins?`,
      shouldAutoStart: true
    };
  } else {
    return {
      period: 'evening' as const,
      isSessionTime: true,
      greeting: hour >= 18 
        ? `Good evening${personalGreeting}! Welcome to this peaceful moment of reflection. How was your day, and what would you like to explore together?`
        : `Hello${personalGreeting}! Even in these quiet nighttime hours, reflection can bring peace and clarity. What's on your mind tonight?`,
      shouldAutoStart: true
    };
  }
}

export function hasCompletedTodaysSession(lastSessionDate?: Date): boolean {
  if (!lastSessionDate) return false;
  const today = new Date().toDateString();
  return lastSessionDate.toDateString() === today;
}

export function getSessionTimeLimit(isPro: boolean): number {
  return isPro ? 60 : 15;
}

export const getNextAvailableSession = (): Date => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 6) {
    const tomorrow = new Date(now);
    tomorrow.setHours(6, 0, 0, 0);
    return tomorrow;
  } else if (hour < 18) {
    const today = new Date(now);
    today.setHours(18, 0, 0, 0);
    return today;
  } else {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0);
    return tomorrow;
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