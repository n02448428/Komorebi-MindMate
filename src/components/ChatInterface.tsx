import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  greeting?: string;
  disabled?: boolean;
  timeOfDay: 'morning' | 'evening';
  messagesRemaining?: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  placeholder = "Share what's on your mind...",
  greeting,
  disabled = false,
  timeOfDay,
  messagesRemaining
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] w-full max-w-2xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[400px] backdrop-blur-md bg-white/10 rounded-t-3xl border border-white/20">
        {greeting && messages.length === 0 && (
          <div className="animate-fade-in">
            <ChatMessage
              message={{
                id: 'greeting',
                content: greeting,
                role: 'assistant',
                timestamp: new Date(),
              }}
              timeOfDay={timeOfDay}
            />
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="animate-slide-up">
            <ChatMessage message={message} timeOfDay={timeOfDay} />
          </div>
        ))}
        
        {isLoading && <TypingIndicator timeOfDay={timeOfDay} />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="backdrop-blur-md bg-white/10 rounded-b-3xl border-x border-b border-white/20 p-4">
        {messagesRemaining !== undefined && messagesRemaining <= 2 && (
          <div className={`text-xs text-center mb-3 ${
            timeOfDay === 'morning' ? 'text-amber-700' : 'text-amber-300'
          }`}>
            {messagesRemaining} messages remaining in free session
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={`flex-1 p-4 rounded-2xl border-0 transition-all duration-200 placeholder-opacity-70 ${
              timeOfDay === 'morning'
                ? 'bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30'
                : 'bg-black/20 text-white placeholder-gray-300 focus:bg-black/30'
            } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || disabled}
            className={`p-4 rounded-2xl font-medium transition-all duration-200 ${
              timeOfDay === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                : 'bg-white/10 hover:bg-white/20 text-white'
            } backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[56px] focus:outline-none focus:ring-2 focus:ring-white/30`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;