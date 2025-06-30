import React from 'react';
import { Clock, Crown, Settings } from 'lucide-react';
import { formatTimeUntilNext } from '../utils/timeUtils';

interface SessionStatusMessagesProps {
  sessionType: 'morning' | 'evening';
  user: any;
  profile: any;
  nextSessionTime?: Date;
  sessionTimeLimit?: number;
  onUpgrade: () => void;
  onInsights: () => void;
  onSettings: () => void;
  onNewSession: () => void;
}

const SessionLimitReachedMessage: React.FC<{
  sessionType: 'morning' | 'evening';
  nextSessionTime: Date;
  onUpgrade: () => void;
}> = ({ sessionType, nextSessionTime, onUpgrade }) => {
  const timeUntilNext = formatTimeUntilNext(nextSessionTime);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm ${
        sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
      } border border-white/20`}>
        <Clock className={`w-10 h-10 ${
          sessionType === 'morning' ? 'text-gray-700' : 'text-white'
        }`} />
      </div>
      
      <h2 className={`text-2xl font-semibold mb-4 ${
        sessionType === 'morning' ? 'text-gray-800' : 'text-white'
      }`}>
        You've completed today's session
      </h2>
      
      <p className={`text-lg mb-6 ${
        sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
      }`}>
        Your next session will be available in {timeUntilNext}
      </p>
      
      <div className={`p-6 rounded-2xl backdrop-blur-sm mb-8 ${
        sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
      } border border-white/20 max-w-md`}>
        <Crown className={`w-8 h-8 mx-auto mb-3 ${
          sessionType === 'morning' ? 'text-amber-600' : 'text-amber-400'
        }`} />
        <h3 className={`text-lg font-semibold mb-2 ${
          sessionType === 'morning' ? 'text-gray-800' : 'text-white'
        }`}>
          Want unlimited sessions?
        </h3>
        <p className={`text-sm mb-4 ${
          sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
        }`}>
          Upgrade to Pro for unlimited conversations, deeper insights, and personalized experiences.
        </p>
        <button
          onClick={onUpgrade}
          className={`w-full p-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            sessionType === 'morning'
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
};

const SessionExpiredMessage: React.FC<{
  sessionType: 'morning' | 'evening';
  sessionTimeLimit: number;
  profile: any;
  onUpgrade: () => void;
  onNewSession: () => void;
}> = ({ sessionType, sessionTimeLimit, profile, onUpgrade, onNewSession }) => {
  return (
    <div className="flex items-center justify-center h-screen p-8">
      <div className="text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm ${
          sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
        } border border-white/20`}>
          <Settings className={`w-10 h-10 ${
            sessionType === 'morning' ? 'text-gray-700' : 'text-white'
          }`} />
        </div>
        
        <h2 className={`text-2xl font-semibold mb-4 ${
          sessionType === 'morning' ? 'text-gray-800' : 'text-white'
        }`}>
          Your {sessionType === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
        </h2>
        
        <p className={`text-lg mb-6 ${
          sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
        }`}>
          Your {sessionTimeLimit}-minute session has ended.
        </p>

        {profile?.is_pro !== true && (
          <div className={`p-6 rounded-2xl backdrop-blur-sm mb-8 ${
            sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
          } border border-white/20 max-w-md mx-auto`}>
            <Crown className={`w-8 h-8 mx-auto mb-3 ${
              sessionType === 'morning' ? 'text-amber-600' : 'text-amber-400'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              sessionType === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Want longer sessions?
            </h3>
            <p className={`text-sm mb-4 ${
              sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              Upgrade to Pro for 1-hour sessions and unlimited conversations.
            </p>
            <button
              onClick={onUpgrade}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
            >
              Upgrade to Pro
            </button>
          </div>
        )}
        
        <button
          onClick={onNewSession}
          className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 ${
            sessionType === 'morning'
              ? 'bg-white/20 hover:bg-white/30 text-gray-800'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          Start New Session
        </button>
      </div>
    </div>
  );
};

const SessionStatusMessages: React.FC<SessionStatusMessagesProps> = ({
  sessionType,
  user,
  profile,
  nextSessionTime,
  sessionTimeLimit,
  onUpgrade,
  onInsights,
  onSettings,
  onNewSession
}) => {
  if (nextSessionTime) {
    return (
      <SessionLimitReachedMessage
        sessionType={sessionType}
        nextSessionTime={nextSessionTime}
        onUpgrade={onUpgrade}
      />
    );
  }

  if (sessionTimeLimit) {
    return (
      <SessionExpiredMessage
        sessionType={sessionType}
        sessionTimeLimit={sessionTimeLimit}
        profile={profile}
        onUpgrade={onUpgrade}
        onNewSession={onNewSession}
      />
    );
  }

  return null;
};

export default SessionStatusMessages;