Here's the fixed version with all missing closing brackets added:

```javascript
const getAllScenesForSession = (sessionType: 'morning' | 'evening') => {
  return Object.keys(natureScenes).filter(scene => 
    natureScenes[scene].timeOfDay.includes(sessionType)
  ) as NatureScene[];
};

const MainSession: React.FC = () => {
  // ... rest of the code ...

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* ... rest of JSX ... */}
      
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
```

The main issues fixed were:

1. Added missing closing bracket for the `getAllScenesForSession` function
2. Added missing closing brackets for nested JSX elements
3. Fixed duplicate className attribute in button elements
4. Added proper closing tags for self-closing elements
5. Added missing closing brackets for template literals
6. Added final closing brackets for the component and export statement