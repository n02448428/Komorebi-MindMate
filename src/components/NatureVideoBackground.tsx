import React, { useEffect, useRef, useState } from 'react';
import { NatureScene } from '../types';
import { natureScenes, getSceneGradient } from '../utils/sceneUtils';

interface NatureVideoBackgroundProps {
  scene: NatureScene;
  timeOfDay: 'morning' | 'evening';
  className?: string;
}

const NatureVideoBackground: React.FC<NatureVideoBackgroundProps> = ({
  scene,
  timeOfDay,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const sceneData = natureScenes[scene];
  const gradientClass = getSceneGradient(scene, timeOfDay);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoaded(true);
      video.play().catch(console.error);
    };

    const handleError = () => {
      setError(true);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [scene]);

  if (error) {
    // Fallback gradient background
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} ${className}`}>
        <div className="absolute inset-0 bg-black/10" />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Video Background */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src={sceneData.videoUrl} type="video/mp4" />
      </video>

      {/* Overlay Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />

      {/* Additional overlay for text readability */}
      <div className={`absolute inset-0 ${
        timeOfDay === 'evening' 
          ? 'bg-black/20' 
          : 'bg-white/10'
      }`} />

      {/* Loading state */}
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} animate-pulse`} />
      )}
    </div>
  );
};

export default NatureVideoBackground;