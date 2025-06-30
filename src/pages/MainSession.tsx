import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ChatInterface from '../components/ChatInterface';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { Eye, EyeOff, SkipForward, Shuffle } from 'lucide-react';
import { natureScenes, type NatureScene } from '../utils/sceneUtils';

const getAllScenesForSession = (sessionType: 'morning' | 'evening') => {
  return Object.keys(natureScenes).filter(scene => 
    natureScenes[scene].timeOfDay.includes(sessionType)
  ) as NatureScene[];
};

const MainSession: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'morning' | 'evening'>('morning');
  const [currentScene, setCurrentScene] = useState<NatureScene>('forestMorning');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') as 'morning' | 'evening';
    const scene = params.get('scene') as NatureScene;
    
    if (type) {
      setSessionType(type);
    }
    
    if (scene && natureScenes[scene]) {
      setCurrentScene(scene);
    } else {
      // Set default scene based on session type
      const defaultScene = type === 'morning' ? 'forestMorning' : 'forestEvening';
      setCurrentScene(defaultScene);
    }

    // Create new session
    createSession(type || 'morning');
  }, []);

  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      setShowControls(true);
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => {
      resetControlsTimeout();
    };

    const handleKeyPress = () => {
      resetControlsTimeout();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);
    
    // Initial timeout
    resetControlsTimeout();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const createSession = async (type: 'morning' | 'evening') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          type,
          scene_type: currentScene,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const toggleVideoBackground = () => {
    setVideoEnabled(!videoEnabled);
  };

  const handleNextScene = () => {
    const availableScenes = getAllScenesForSession(sessionType);
    const currentIndex = availableScenes.indexOf(currentScene);
    const nextIndex = (currentIndex + 1) % availableScenes.length;
    setCurrentScene(availableScenes[nextIndex]);
  };

  const handleRandomScene = () => {
    const availableScenes = getAllScenesForSession(sessionType);
    const filteredScenes = availableScenes.filter(scene => scene !== currentScene);
    const randomIndex = Math.floor(Math.random() * filteredScenes.length);
    setCurrentScene(filteredScenes[randomIndex]);
  };

  if (!sessionId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Starting your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* Background */}
      {videoEnabled ? (
        <NatureVideoBackground scene={currentScene} />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${
          sessionType === 'morning' 
            ? 'from-blue-100 via-green-50 to-yellow-50' 
            : 'from-indigo-900 via-purple-900 to-blue-900'
        }`} />
      )}

      {/* Chat Interface */}
      <div className="relative z-10 flex-1 flex flex-col">
        <ChatInterface 
          sessionId={sessionId} 
          sessionType={sessionType}
          onSessionComplete={() => navigate('/insights')}
        />
      </div>
      
      {/* Session Controls */}
      <div className="absolute inset-0 z-20">
        {/* Left side - Branding */}
        <div className={`absolute left-6 top-6 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          {showControls && (
            <div>
              <div className={`text-2xl font-bold ${
                sessionType === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Komorebi
              </div>
              {videoEnabled && (
                <div className={`text-sm font-medium mt-0.5 ${
                  sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  {natureScenes[currentScene]?.name || currentScene}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - Controls Container */}
        <div className="absolute right-6 top-6 flex items-center gap-3">
          <div className={`flex items-center gap-2 backdrop-blur-sm border border-white/20 rounded-2xl p-2 transition-all duration-300 ${
            showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
          } ${
            sessionType === 'morning' 
              ? 'bg-white/20' 
              : 'bg-white/10'
          }`}>
            {showControls && (
              <>
                {/* Background Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={toggleVideoBackground}
                    title={videoEnabled ? 'Hide video background' : 'Show video background'}
                    className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                      sessionType === 'morning'
                        ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {videoEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  
                  {videoEnabled && (
                    <>
                      <button
                        onClick={handleNextScene}
                        className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                          sessionType === 'morning'
                            ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={handleRandomScene}
                        title="Random scene"
                        className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                          sessionType === 'morning'
                            ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSession;