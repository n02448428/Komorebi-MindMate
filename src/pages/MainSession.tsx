Here's the fixed version with all missing closing brackets added:

```typescript
                    <Settings className="w-4 h-4" />
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Controls Button */}
          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-2 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
              sessionType === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {showControls ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-2 px-6 flex-1 flex flex-col min-h-0">
        {/* Rest of the component content */}
      </div>
    </div>
  );
};

export default MainSession;
```

I've added the missing closing brackets for several nested components and blocks. The main issues were:

1. Missing closing brackets for nested conditional rendering blocks
2. Missing closing tags for button components
3. Missing closing brackets for the main component structure

The code should now be properly balanced with all brackets and tags closed appropriately.