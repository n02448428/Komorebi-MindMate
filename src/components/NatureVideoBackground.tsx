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

    // Reset states when scene changes
    setIsLoaded(false);
    setError(false);

    const handleLoadedData = () => {
      console.log(`Video loaded successfully: ${scene}`);
      setIsLoaded(true);
    };

    const handleCanPlay = () => {
      console.log(`Video can play: ${scene}`);
      if (!isLoaded) {
        setIsLoaded(true);
      }
      // Attempt to play the video
      video.play().catch((playError) => {
        console.error('Error playing video:', playError);
        // Try to play again after a short delay
        setTimeout(() => {
          video.play().catch(console.error);
        }, 500);
      });
    };

    const handleError = (e: Event) => {
      console.error(`Video loading error for scene ${scene}:`, {
        error: e,
        videoUrl: sceneData.videoUrl,
        videoElement: video,
        networkState: video.networkState,
        readyState: video.readyState
      });
      setError(true);
    };

    const handlePlay = () => {
      console.log(`Video playing: ${scene}`);
    };

    const handlePause = () => {
      console.log(`Video paused: ${scene}`);
      // Try to resume playing if it was paused unexpectedly
      if (!video.ended && !error) {
        setTimeout(() => {
          video.play().catch(console.error);
        }, 100);
      }
    };

    // Add event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Force video to reload by setting the source
    console.log(`Loading video: ${scene} - ${sceneData.videoUrl}`);
    video.src = sceneData.videoUrl;
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [scene, sceneData.videoUrl]); // Removed isLoaded from dependencies to prevent infinite loop

  if (error) {
    // Fallback gradient background
    console.log(`Using fallback gradient for scene: ${scene}`);
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} ${className}`}>
        <div className="absolute inset-0 bg-black/10" />
        {/* Optional: Add a subtle pattern or texture for the fallback */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full translate-y-24 -translate-x-24" />
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Video Background */}
      <video
        ref={videoRef}
        key={sceneData.videoUrl} // Force re-mount when URL changes
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      >
        <source src={sceneData.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-all duration-1000`} />

      {/* Additional overlay for text readability */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        timeOfDay === 'evening' 
          ? 'bg-black/20' 
          : 'bg-white/10'
      }`} />

      {/* Loading state */}
      {!isLoaded && !error && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} animate-pulse`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-sm font-medium ${
              timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-300'
            } opacity-70`}>
              Loading {sceneData.name}...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NatureVideoBackground;