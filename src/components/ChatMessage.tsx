import React, { memo } from 'react';
import type { Message } from '../types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  key?: string;
  message: Message;
  timeOfDay: 'morning' | 'evening';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, timeOfDay }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 md:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
        isUser 
          ? (timeOfDay === 'morning' ? 'bg-white/20 group-hover:bg-white/30' : 'bg-white/10 group-hover:bg-white/20')
          : (timeOfDay === 'morning' ? 'bg-black/10 group-hover:bg-black/15' : 'bg-black/20 group-hover:bg-black/30')
      }`}>
        {isUser ? (
          <User className={`w-4 h-4 md:w-5 md:h-5 ${
            timeOfDay === 'morning' ? 'text-gray-700' : 'text-gray-200'
          }`} />
        ) : (
          <Bot className={`w-4 h-4 md:w-5 md:h-5 ${
            timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-300'
          }`} />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[85%] md:max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-3 md:p-4 rounded-2xl md:rounded-3xl backdrop-blur-sm transition-all duration-200 ${
          isUser
            ? (timeOfDay === 'morning' 
                ? 'bg-white/25 text-gray-800 group-hover:bg-white/35' 
                : 'bg-white/15 text-white group-hover:bg-white/25')
            : (timeOfDay === 'morning'
                ? 'bg-black/10 text-gray-800 group-hover:bg-black/15'
                : 'bg-black/20 text-white group-hover:bg-black/30')
        } ${isUser ? 'rounded-br-lg' : 'rounded-bl-lg'} border border-white/10 shadow-sm`}>
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
            {message.content}
          </p>
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs mt-1 md:mt-2 transition-opacity duration-200 opacity-0 group-hover:opacity-70 ${
          timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-300'
        } ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(ChatMessage);