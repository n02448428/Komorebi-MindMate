import { NatureScene } from '../types';

export const natureScenes: Record<NatureScene, {
  name: string;
  videoUrl: string;
  description: string;
  mood: 'calming' | 'energizing' | 'peaceful' | 'grounding';
  timePreference: 'morning' | 'evening' | 'both';
}> = {
  ocean: {
    name: 'Ocean Waves',
    videoUrl: 'https://player.vimeo.com/external/370467553.sd.mp4?s=e90dcaba73c19e0e36f03406b47bbd6a92d0fda0&profile_id=139&oauth2_token_id=57447761',
    description: 'Gentle waves meeting the shore',
    mood: 'calming',
    timePreference: 'both'
  },
  forest: {
    name: 'Forest Canopy',
    videoUrl: 'https://player.vimeo.com/external/195913085.sd.mp4?s=7c12c7c0c0e7f0c0c0c0c0c0c0c0c0c0c0c0c0c0&profile_id=139',
    description: 'Sunlight filtering through trees',
    mood: 'grounding',
    timePreference: 'morning'
  },
  desert: {
    name: 'Desert Dunes',
    videoUrl: 'https://player.vimeo.com/external/195913086.sd.mp4?s=8d13d8d0d0e8f0d0d0d0d0d0d0d0d0d0d0d0d0d0&profile_id=139',
    description: 'Rolling sand dunes under vast sky',
    mood: 'peaceful',
    timePreference: 'both'
  },
  mountain: {
    name: 'Mountain Vista',
    videoUrl: 'https://player.vimeo.com/external/195913087.sd.mp4?s=9e14e9e0e0f9f0e0e0e0e0e0e0e0e0e0e0e0e0e0&profile_id=139',
    description: 'Majestic peaks and flowing clouds',
    mood: 'energizing',
    timePreference: 'morning'
  },
  lake: {
    name: 'Serene Lake',
    videoUrl: 'https://player.vimeo.com/external/195913088.sd.mp4?s=af15faf0f0faf0f0f0f0f0f0f0f0f0f0f0f0f0f0&profile_id=139',
    description: 'Still waters reflecting the sky',
    mood: 'peaceful',
    timePreference: 'evening'
  },
  meadow: {
    name: 'Wildflower Meadow',
    videoUrl: 'https://player.vimeo.com/external/195913089.sd.mp4?s=bf16fbf0f0fbf0f0f0f0f0f0f0f0f0f0f0f0f0f0&profile_id=139',
    description: 'Gentle breeze through wildflowers',
    mood: 'calming',
    timePreference: 'both'
  }
};

export const getSceneForSession = (
  sessionType: 'morning' | 'evening',
  userPreference?: NatureScene
): NatureScene => {
  if (userPreference) return userPreference;
  
  const availableScenes = Object.entries(natureScenes)
    .filter(([_, scene]) => 
      scene.timePreference === sessionType || scene.timePreference === 'both'
    )
    .map(([key]) => key as NatureScene);
  
  return availableScenes[Math.floor(Math.random() * availableScenes.length)];
};

export const getNextScene = (
  currentScene: NatureScene,
  sessionType: 'morning' | 'evening'
): NatureScene => {
  // Get all scenes that match the session type
  const availableScenes = Object.entries(natureScenes)
    .filter(([_, scene]) => 
      scene.timePreference === sessionType || scene.timePreference === 'both'
    )
    .map(([key]) => key as NatureScene);
  
  // Find current scene index
  const currentIndex = availableScenes.indexOf(currentScene);
  
  // Get next scene (cycle back to beginning if at end)
  const nextIndex = (currentIndex + 1) % availableScenes.length;
  
  return availableScenes[nextIndex];
};

export const getSceneGradient = (scene: NatureScene, timeOfDay: 'morning' | 'evening'): string => {
  const gradients = {
    ocean: {
      morning: 'from-blue-100/20 via-cyan-50/20 to-blue-200/20',
      evening: 'from-indigo-900/30 via-blue-800/30 to-purple-900/30'
    },
    forest: {
      morning: 'from-green-100/20 via-emerald-50/20 to-green-200/20',
      evening: 'from-green-900/30 via-emerald-800/30 to-green-900/30'
    },
    desert: {
      morning: 'from-orange-100/20 via-amber-50/20 to-yellow-200/20',
      evening: 'from-orange-900/30 via-red-800/30 to-purple-900/30'
    },
    mountain: {
      morning: 'from-gray-100/20 via-slate-50/20 to-blue-200/20',
      evening: 'from-gray-900/30 via-slate-800/30 to-indigo-900/30'
    },
    lake: {
      morning: 'from-blue-100/20 via-teal-50/20 to-cyan-200/20',
      evening: 'from-blue-900/30 via-indigo-800/30 to-purple-900/30'
    },
    meadow: {
      morning: 'from-green-100/20 via-lime-50/20 to-yellow-200/20',
      evening: 'from-green-900/30 via-emerald-800/30 to-teal-900/30'
    }
  };
  
  return gradients[scene][timeOfDay];
};

export const getAllScenesForSession = (sessionType: 'morning' | 'evening'): NatureScene[] => {
  return Object.entries(natureScenes)
    .filter(([_, scene]) => 
      scene.timePreference === sessionType || scene.timePreference === 'both'
    )
    .map(([key]) => key as NatureScene);
};

export const getSceneDisplayName = (scene: NatureScene): string => {
  return natureScenes[scene].name;
};