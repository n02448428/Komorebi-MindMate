import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay, getSceneForSession, getNextScene } from '../utils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import ChatInterface from '../components/ChatInterface';
import { Message, NatureScene } from '../types';
import { Eye, EyeOff, SkipForward, Shuffle, Settings, User, Crown } from 'lucide-react';

const MainSession: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentScene, setCurrentScene] = useState<NatureScene>('ocean');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const timeOfDay = getTimeOfDay(profile?.name);
  const sessionType = timeOfDay.period === 'morning' ? 'morning' : 'evening';

  useEffect(() => {
    // Only proceed when auth loading is complete
    if (authLoading) return;

    // If no user after auth loading is complete, redirect to login
    if (!user) {
      navigate('/');
      return;
    }

    // Initialize session
    initializeSession();
  }, [authLoading, user, navigate, profile]);

  useEffect(() => {
    // Auto-hide controls after 3 seconds of inactivity
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      setShowControls(true);
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetControlsTimeout();
    const handleKeyPress = () => resetControlsTimeout();

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

  const initializeSession = () => {
    try {
      // Load saved video setting
      const savedVideoEnabled = localStorage.getItem('video-background-enabled');
      if (savedVideoEnabled !== null) {
        setVideoEnabled(JSON.parse(savedVideoEnabled));
      }

      // Set scene based on session type
      const savedScene = localStorage.getItem('current-scene') as NatureScene;
      if (savedScene && ['ocean', 'forest', 'desert', 'mountain', 'lake', 'meadow'].includes(savedScene)) {
        setCurrentScene(savedScene);
      } else {
        const initialScene = getSceneForSession(sessionType);
        setCurrentScene(initialScene);
        localStorage.setItem('current-scene', initialScene);
      }

      // Add initial greeting message
      const greetingMessage: Message = {
        id: 'greeting',
        content: timeOfDay.greeting,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);

      // Set session start time
      const startTime = new Date();
      setSessionStartTime(startTime);
      localStorage.setItem('session-start-time', startTime.toISOString());
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate AI response for now
      setTimeout(() => {
        const responses = [
          `Thank you for sharing that. I appreciate your openness and would love to explore this further with you. What feels most important to focus on right now?`,
          `I hear you saying ${content.slice(0, 20)}... That sounds meaningful. Can you tell me more about what that brings up for you?`,
          `It takes courage to share something like that. What would it feel like to approach this with gentleness toward yourself?`,
          `I'm grateful you're taking this time for reflection. What insights are emerging as you sit with these thoughts?`
        ];
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responses[Math.floor(Math.random() * responses.length)],
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000); // Add some variation
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsLoading(false);
    }
  };

  const toggleVideoBackground = () => {
    const newVideoEnabled = !videoEnabled;
    setVideoEnabled(newVideoEnabled);
    localStorage.setItem('video-background-enabled', JSON.stringify(newVideoEnabled));
  };

  const handleNextScene = () => {
    try {
      const nextScene = getNextScene(currentScene, sessionType);
      setCurrentScene(nextScene);
      localStorage.setItem('current-scene', nextScene);
    } catch (error) {
      console.error('Error changing scene:', error);
    }
  };

  const handleRandomScene = () => {
    try {
      const scenes: NatureScene[] = ['ocean', 'forest', 'desert', 'mountain', 'lake', 'meadow'];
      const otherScenes = scenes.filter(scene => scene !== currentScene);
      const randomScene = otherScenes[Math.floor(Math.random() * otherScenes.length)];
      setCurrentScene(randomScene);
      localStorage.setItem('current-scene', randomScene);
    } catch (error) {
      console.error('Error changing to random scene:', error);
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleProfile = () => {
    navigate('/insights');
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Show message if no user (shouldn't happen due to redirect, but just in case)
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to continue</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* Background */}
      {videoEnabled ? (
        <NatureVideoBackground 
          scene={currentScene} 
          timeOfDay={sessionType} 
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${
          sessionType === 'morning' 
            ? 'from-amber-100 via-orange-50 to-yellow-100'
            : 'from-indigo-900 via-purple-900 to-blue-900'
        }`} />
      )}

      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        {/* Left side - Title */}
        <div className={`absolute left-6 top-6 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
        }`}>
          {showControls && (
            <div>
              <div className={`text-2xl font-bold ${
                sessionType === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Komorebi
              </div>
              <div className={`text-sm font-medium mt-0.5 ${
                sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                {sessionType === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="absolute right-6 top-6 flex items-center gap-3">
          {/* Scene Controls */}
          <div className={`flex items-center gap-2 backdrop-blur-sm border border-white/20 rounded-2xl p-2 transition-all duration-300 ${
            showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
          } ${
            sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            {showControls && (
              <>
                <button
                  onClick={toggleVideoBackground}
                  title={videoEnabled ? 'Hide video background' : 'Show video background'}
                  className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
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
                      title="Next scene"
                      className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
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
                      className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                        sessionType === 'morning'
                          ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Separator */}
                <div className={`w-px h-6 ${
                  sessionType === 'morning' ? 'bg-gray-400/30' : 'bg-white/30'
                }`} />

                {/* User Controls */}
                {profile?.is_pro !== true && (
                  <button
                    onClick={handleUpgrade}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-medium transition-all duration-200 flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3" />
                    Pro
                  </button>
                )}

                <button
                  onClick={handleProfile}
                  className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSettings}
                  className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-4 px-6 flex-1 flex flex-col min-h-0">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          timeOfDay={sessionType}
          placeholder={`Share what's on your mind...`}
        />
      </div>

      {/* Privacy Notice */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-[10px] sm:text-xs whitespace-nowrap ${
          sessionType === 'morning' ? 'text-gray-900' : 'text-white'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default MainSession;