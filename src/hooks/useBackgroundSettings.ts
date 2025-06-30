import { useState, useEffect } from 'react';
import { NatureScene } from '../types';
import { getSceneForSession, getNextScene, getAllScenesForSession } from '../utils/sceneUtils';

interface UseBackgroundSettingsProps {
  sessionType: 'morning' | 'evening';
  storage: {
    get: <T>(key: string, defaultValue: T) => T;
    set: <T>(key: string, value: T) => void;
  };
}

export const useBackgroundSettings = ({ sessionType, storage }: UseBackgroundSettingsProps) => {
  const [currentScene, setCurrentScene] = useState<NatureScene>('ocean');
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    // Load settings from localStorage
    const savedVideoEnabled = storage.get('video-background-enabled', 'true');
    if (savedVideoEnabled !== null) {
      setVideoEnabled(typeof savedVideoEnabled === 'string' ? JSON.parse(savedVideoEnabled) : savedVideoEnabled);
    }

    const savedScene = storage.get('current-scene', '') as NatureScene;
    if (savedScene) {
      setCurrentScene(savedScene);
    } else {
      // Set initial scene based on session type
      const initialScene = getSceneForSession(sessionType);
      setCurrentScene(initialScene);
      storage.set('current-scene', initialScene);
    }
  }, [sessionType]);

  const handleNextScene = () => {
    const nextScene = getNextScene(currentScene, sessionType);
    setCurrentScene(nextScene);
    storage.set('current-scene', nextScene);
  };

  const handleRandomScene = () => {
    const availableScenes = getAllScenesForSession(sessionType);
    const otherScenes = availableScenes.filter(scene => scene !== currentScene);
    const randomScene = otherScenes[Math.floor(Math.random() * otherScenes.length)];
    setCurrentScene(randomScene);
    storage.set('current-scene', randomScene);
  };

  const toggleVideoBackground = () => {
    const newVideoEnabled = !videoEnabled;
    setVideoEnabled(newVideoEnabled);
    storage.set('video-background-enabled', JSON.stringify(newVideoEnabled));
  };

  return {
    currentScene,
    videoEnabled,
    handleNextScene,
    handleRandomScene,
    toggleVideoBackground
  };
};