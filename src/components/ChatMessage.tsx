import React from 'react';
import { Message } from '../types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  timeOfDay: 'morning' | 'evening';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, timeOfDay }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${
        isUser 
          ? (timeOfDay === 'morning' ? 'bg-white/20' : 'bg-white/10')
          : (timeOfDay === 'morning' ? 'bg-black/10' : 'bg-black/20')
      }`}>
        {isUser ? (
          <User className={`w-5 h-5 ${
            timeOfDay === 'morning' ? 'text-gray-700' : 'text-gray-200'
          }`} />
        ) : (
          <Bot className={`w-5 h-5 ${
            timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-300'
          }`} />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-4 rounded-3xl backdrop-blur-sm ${
          isUser
            ? (timeOfDay === 'morning' 
                ? 'bg-white/25 text-gray-800' 
                : 'bg-white/15 text-white')
            : (timeOfDay === 'morning'
                ? 'bg-black/10 text-gray-800'
                : 'bg-black/20 text-white')
        } ${isUser ? 'rounded-br-lg' : 'rounded-bl-lg'} border border-white/10`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {message.content}
          </p>
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs mt-2 ${
          timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-300'
        } opacity-70`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;