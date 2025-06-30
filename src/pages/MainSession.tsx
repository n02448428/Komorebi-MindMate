Here's the fixed version with all missing closing brackets added:

```typescript
                <button
                  onClick={() => navigate('/')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    sessionType === 'morning'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Sign Up Now
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {!user && !isGuest && messages.length > 1 && showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-center flex-shrink-0"
            >
              <div className={`p-4 rounded-2xl backdrop-blur-sm border border-white/20 max-w-md mx-auto ${
                sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
              }`}>
                <p className={`text-sm mb-3 ${
                  sessionType === 'morning' ? 'text-gray-700' : 'text-white'
                }`}>
                  Sign in to save your insights and track your progress
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
                >
                  Sign Up to Save
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Privacy Notice - Bottom of page */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={\`text-[10px] sm:text-xs whitespace-nowrap ${
          sessionType === 'morning' 
            ? 'text-gray-900' 
            : 'text-white'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default MainSession;
```