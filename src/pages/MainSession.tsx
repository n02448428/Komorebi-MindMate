Here's the fixed version with all missing closing brackets added:

```typescript
                      className={`px-3 py-1 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                        sessionType === 'morning'
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700'
                          : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300'
                      }`}
                    >
                      <Crown className="w-3 h-3" />
                      <span className="text-xs font-medium">Pro</span>
                    </button>
                  )}

                  {user && (
                    <>
                      <button
                        onClick={handleInsights}
                        className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                          sessionType === 'morning'
                            ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <User className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSettings}
                        className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
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
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MainSession;
```