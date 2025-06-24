import React from 'react';
import { Clock, Crown, ArrowRight } from 'lucide-react';
import { formatTimeUntilNext } from '../utils/timeUtils';

interface SessionLimitReachedProps {
  nextSessionTime: Date;
  timeOfDay: 'morning' | 'evening';
  onUpgrade: () => void;
}

const SessionLimitReached: React.FC<SessionLimitReachedProps> = ({
  nextSessionTime,
  timeOfDay,
  onUpgrade
}) => {
  const timeUntilNext = formatTimeUntilNext(nextSessionTime);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm ${
        timeOfDay === 'morning' ? 'bg-white/20' : 'bg-white/10'
      } border border-white/20`}>
        <Clock className={`w-10 h-10 ${
          timeOfDay === 'morning' ? 'text-gray-700' : 'text-white'
        }`} />
      </div>
      
      <h2 className={`text-2xl font-semibold mb-4 ${
        timeOfDay === 'morning' ? 'text-gray-800' : 'text-white'
      }`}>
        You've completed today's session
      </h2>
      
      <p className={`text-lg mb-6 ${
        timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-300'
      }`}>
        Your next session will be available in {timeUntilNext}
      </p>
      
      <div className={`p-6 rounded-2xl backdrop-blur-sm mb-8 ${
        timeOfDay === 'morning' ? 'bg-white/20' : 'bg-white/10'
      } border border-white/20 max-w-md`}>
        <Crown className={`w-8 h-8 mx-auto mb-3 ${
          timeOfDay === 'morning' ? 'text-amber-600' : 'text-amber-400'
        }`} />
        <h3 className={`text-lg font-semibold mb-2 ${
          timeOfDay === 'morning' ? 'text-gray-800' : 'text-white'
        }`}>
          Want unlimited sessions?
        </h3>
        <p className={`text-sm mb-4 ${
          timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-300'
        }`}>
          Upgrade to Pro for unlimited conversations, deeper insights, and personalized experiences.
        </p>
        <button
          onClick={onUpgrade}
          className={`w-full p-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            timeOfDay === 'morning'
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          Upgrade to Pro
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SessionLimitReached;