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
  disabled?: boolean;
  timeOfDay: 'morning' | 'evening';
  isImmersive?: boolean;
  messagesRemaining?: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  placeholder = "Share what's on your mind...",
  disabled = false,
  timeOfDay,
  isImmersive = false,
  messagesRemaining
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px height
    textarea.style.height = `${newHeight}px`;
  };

  return (
    <div className={`flex flex-col h-full w-full mx-auto ${
      isImmersive 
        ? 'max-h-[100vh] max-w-full' 
        : 'max-h-[85vh] max-w-full sm:max-w-xl md:max-w-3xl'
    }`}>
      {/* Chat Messages */}
      <div className={`flex-1 overflow-y-auto space-y-4 md:space-y-6 backdrop-blur-md bg-white/10 border border-white/20 ${
        isImmersive 
          ? 'p-6 min-h-[70vh] rounded-3xl' 
          : 'p-4 md:p-6 min-h-[50vh] sm:min-h-[400px] rounded-t-3xl'
      }`}>
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ChatMessage message={message} timeOfDay={timeOfDay} />
          </div>
        ))}
        
        {isLoading && <TypingIndicator timeOfDay={timeOfDay} />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`backdrop-blur-md bg-white/10 border border-white/20 p-4 ${
        isImmersive ? 'rounded-3xl mt-4' : 'rounded-b-3xl border-x border-b'
      }`}>
        {messagesRemaining !== undefined && messagesRemaining <= 2 && (
          <div className={`text-xs text-center mb-3 ${
            timeOfDay === 'morning' ? 'text-amber-700' : 'text-amber-300'
          }`}>
            {messagesRemaining} messages remaining in free session
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className={`w-full p-4 rounded-2xl border-0 transition-all duration-200 placeholder-opacity-70 resize-none ${
                timeOfDay === 'morning'
                  ? 'bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30'
                  : 'bg-black/20 text-white placeholder-gray-300 focus:bg-black/30'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{ 
                minHeight: '56px',
                maxHeight: '120px',
                lineHeight: '1.5'
              }}
            />
            {/* Character count for longer messages */}
            {inputValue.length > 100 && (
              <div className={`absolute bottom-2 right-2 text-xs ${
                timeOfDay === 'morning' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {inputValue.length}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || disabled}
            className={`p-4 rounded-2xl font-medium transition-all duration-200 ${
              timeOfDay === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                : 'bg-white/10 hover:bg-white/20 text-white'
            } backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[56px] min-h-[56px] focus:outline-none focus:ring-2 focus:ring-white/30`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        {/* Helpful hints */}
        {!isImmersive && (
          <div className={`text-xs mt-2 text-center ${
            timeOfDay === 'morning' ? 'text-gray-600' : 'text-gray-400'
          } opacity-70`}>
            Press Enter to send • Shift+Enter for new line
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;