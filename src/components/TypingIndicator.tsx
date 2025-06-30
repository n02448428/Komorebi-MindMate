import React, { memo } from 'react';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  timeOfDay: 'morning' | 'evening';
}

// Optimized version using memo to prevent unnecessary re-renders
const TypingIndicator: React.FC<TypingIndicatorProps> = memo(({ timeOfDay }) => {
  const dotClass = timeOfDay === 'morning' ? 'bg-gray-500' : 'bg-gray-400';
  
  return (
    <div className="flex gap-4">
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${
        timeOfDay === 'morning' ? 'bg-black/10' : 'bg-black/20'
      }`}>
        <Bot className={timeOfDay === 'morning' ? 'w-5 h-5 text-gray-600' : 'w-5 h-5 text-gray-300'} />
      </div>

      {/* Typing Animation */}
      <div className={`inline-block p-4 rounded-3xl rounded-bl-lg backdrop-blur-sm border border-white/10 ${
        timeOfDay === 'morning'
          ? 'bg-black/10 text-gray-800'
          : 'bg-black/20 text-white'
      }`}>
        <div className="flex space-x-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${dotClass}`}></div>
          <div className={`w-2 h-2 rounded-full animate-pulse ${dotClass}`} style={{ animationDelay: '0.2s' }}></div>
          <div className={`w-2 h-2 rounded-full animate-pulse ${dotClass}`} style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
});

export default TypingIndicator;