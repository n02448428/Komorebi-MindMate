<button
                      onClick={handleSettingsClick}
                      className={`p-2 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                        sessionType === 'morning'
                          ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
              </motion.div>

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
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-2 px-6 flex-1 flex flex-col min-h-0">