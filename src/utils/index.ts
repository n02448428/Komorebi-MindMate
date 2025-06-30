// Consolidated utilities
import { NatureScene } from '../types';

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

// Storage utilities
export const STORAGE_KEYS = {
  INSIGHT_CARDS: 'insight-cards',
  CHAT_SESSIONS: 'komorebi-chat-sessions',
  SESSION_LIMITS: 'session-limits',
  SESSION_START_TIME: 'session-start-time',
  CURRENT_SESSION_MESSAGES: 'current-session-messages',
  CURRENT_SCENE: 'current-scene',
  VIDEO_ENABLED: 'video-background-enabled',
};

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Storage error for ${key}:`, error);
  }
}

// Scene utilities
export const natureScenes: Record<NatureScene, {
  name: string;
  videoUrl: string;
  thumbnailUrl: string;
}> = {
  ocean: {
    name: 'Ocean Waves',
    videoUrl: 'https://videos.pexels.com/video-files/6735144/6735144-uhd_2560_1440_30fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  forest: {
    name: 'Forest Canopy',
    videoUrl: 'https://videos.pexels.com/video-files/30039186/12886404_1920_1080_60fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/165754/pexels-photo-165754.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  desert: {
    name: 'Desert Dunes',
    videoUrl: 'https://videos.pexels.com/video-files/29660258/12759696_2560_1440_60fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  mountain: {
    name: 'Mountain Vista',
    videoUrl: 'https://videos.pexels.com/video-files/4288020/4288020-uhd_2560_1440_24fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  lake: {
    name: 'Serene Lake',
    videoUrl: 'https://videos.pexels.com/video-files/27868037/12249511_2560_1440_24fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/1402850/pexels-photo-1402850.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  meadow: {
    name: 'Wildflower Meadow',
    videoUrl: 'https://videos.pexels.com/video-files/32347280/13800782_2048_1080_30fps.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/2909077/pexels-photo-2909077.jpeg?auto=compress&cs=tinysrgb&w=800',
  }
};

export function getSceneForSession(sessionType: 'morning' | 'evening'): NatureScene {
  const morningScenes: NatureScene[] = ['forest', 'mountain', 'meadow'];
  const eveningScenes: NatureScene[] = ['ocean', 'lake', 'desert'];
  const scenes = sessionType === 'morning' ? morningScenes : eveningScenes;
  return scenes[Math.floor(Math.random() * scenes.length)];
}

export function getNextScene(current: NatureScene, sessionType: 'morning' | 'evening'): NatureScene {
  const scenes = Object.keys(natureScenes) as NatureScene[];
  const currentIndex = scenes.indexOf(current);
  return scenes[(currentIndex + 1) % scenes.length];
}

export function getSceneGradient(scene: NatureScene, timeOfDay: 'morning' | 'evening'): string {
  const gradients = {
    ocean: timeOfDay === 'morning' ? 'from-blue-100/20 to-cyan-200/20' : 'from-indigo-900/30 to-blue-900/30',
    forest: timeOfDay === 'morning' ? 'from-green-100/20 to-emerald-200/20' : 'from-green-900/30 to-emerald-900/30',
    desert: timeOfDay === 'morning' ? 'from-orange-100/20 to-yellow-200/20' : 'from-orange-900/30 to-red-900/30',
    mountain: timeOfDay === 'morning' ? 'from-gray-100/20 to-blue-200/20' : 'from-gray-900/30 to-indigo-900/30',
    lake: timeOfDay === 'morning' ? 'from-blue-100/20 to-teal-200/20' : 'from-blue-900/30 to-indigo-900/30',
    meadow: timeOfDay === 'morning' ? 'from-green-100/20 to-lime-200/20' : 'from-green-900/30 to-teal-900/30'
  };
  return `bg-gradient-to-br ${gradients[scene]}`;
}

// Style utilities
export function getButtonClass(timeOfDay: 'morning' | 'evening', variant: 'primary' | 'secondary' = 'secondary'): string {
  const base = 'backdrop-blur-sm border border-white/20 transition-all duration-200';
  if (variant === 'primary') {
    return `${base} ${timeOfDay === 'morning' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`;
  }
  return `${base} ${timeOfDay === 'morning' ? 'bg-white/20 hover:bg-white/30 text-gray-700' : 'bg-white/10 hover:bg-white/20 text-white'}`;
}

export function getTextClass(timeOfDay: 'morning' | 'evening', variant: 'primary' | 'secondary' = 'primary'): string {
  if (variant === 'secondary') {
    return timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-300';
  }
  return timeOfDay === 'morning' ? 'text-gray-800' : 'text-white';
}

export function getCardClass(timeOfDay: 'morning' | 'evening'): string {
  return `backdrop-blur-sm border border-white/20 ${timeOfDay === 'morning' ? 'bg-white/20' : 'bg-white/10'}`;
}