import React from 'react';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  timeOfDay: 'morning' | 'evening';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ timeOfDay }) => {
  return (
    <div className="flex gap-4">
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${
        timeOfDay === 'morning' ? 'bg-black/10' : 'bg-black/20'
      }`}>
        <Bot className={`w-5 h-5 ${
          timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-300'
        }`} />
      </div>

      {/* Typing Animation */}
      <div className={`inline-block p-4 rounded-3xl rounded-bl-lg backdrop-blur-sm border border-white/10 ${
        timeOfDay === 'morning'
          ? 'bg-black/10 text-gray-800'
          : 'bg-black/20 text-white'
      }`}>
        <div className="flex space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            timeOfDay === 'morning' ? 'bg-gray-500' : 'bg-gray-400'
          }`}></div>
          <div className={`w-2 h-2 rounded-full ${
            timeOfDay === 'morning' ? 'bg-gray-500' : 'bg-gray-400'
          }`}></div>
          <div className={`w-2 h-2 rounded-full ${
            timeOfDay === 'morning' ? 'bg-gray-500' : 'bg-gray-400'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;