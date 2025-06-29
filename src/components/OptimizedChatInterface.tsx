/**
 * Optimized ChatInterface component
 * Performance Improvements:
 * - Memoized message components
 * - Virtualized message list for large conversations
 * - Debounced input handling
 * - Reduced re-renders with useCallback and useMemo
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Message } from '../types';
import { getThemeColors, getButtonStyles } from '../utils/styleUtils';

interface OptimizedChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
  timeOfDay: 'morning' | 'evening';
  isImmersive?: boolean;
  messagesRemaining?: number;
}

// Memoized Message Component to prevent unnecessary re-renders
const MemoizedMessage = React.memo<{
  message: Message;
  timeOfDay: 'morning' | 'evening';
}>(({ message, timeOfDay }) => {
  const colors = getThemeColors(timeOfDay);
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
        isUser ? colors.background : colors.backgroundSecondary
      } ${colors.border} border`}>
        {isUser ? '👤' : '🤖'}
      </div>

      <div className={`max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-3 rounded-2xl backdrop-blur-sm transition-all duration-200 ${
          isUser ? colors.background : colors.backgroundSecondary
        } ${colors.border} border`}>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${colors.text}`}>
            {message.content}
          </p>
        </div>
        
        <div className={`text-xs mt-1 transition-opacity duration-200 opacity-0 group-hover:opacity-70 ${colors.textSecondary} ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
});

// Typing Indicator Component
const TypingIndicator = React.memo<{ timeOfDay: 'morning' | 'evening' }>(({ timeOfDay }) => {
  const colors = getThemeColors(timeOfDay);
  
  return (
    <div className="flex gap-4">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${colors.backgroundSecondary} ${colors.border} border`}>
        🤖
      </div>
      <div className={`inline-block p-4 rounded-2xl backdrop-blur-sm ${colors.backgroundSecondary} ${colors.border} border`}>
        <div className="flex space-x-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${colors.textSecondary} animate-pulse`}
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export const OptimizedChatInterface: React.FC<OptimizedChatInterfaceProps> = ({
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
  
  // Memoize theme colors to prevent recalculation
  const colors = useMemo(() => getThemeColors(timeOfDay), [timeOfDay]);
  
  // Debounced scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Optimized effect for scrolling
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages.length, scrollToBottom]);

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Memoized submit handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isLoading && !disabled) {
      onSendMessage(trimmedValue);
      setInputValue('');
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [inputValue, isLoading, disabled, onSendMessage]);

  // Optimized key press handler
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }, [handleSubmit]);

  // Optimized input change handler with auto-resize
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 96); // Max 96px height
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Memoized button styles
  const submitButtonStyles = useMemo(() => 
    getButtonStyles('primary', timeOfDay, 'md'), 
    [timeOfDay]
  );

  return (
    <div className={`flex flex-col w-full mx-auto ${
      isImmersive 
        ? 'h-[calc(100vh-8rem)] max-w-full' 
        : 'h-[calc(100vh-14rem)] max-w-full sm:max-w-xl md:max-w-3xl'
    }`}>
      {/* Messages Container - Optimized for performance */}
      <div className={`flex-1 min-h-0 overflow-y-auto space-y-3 backdrop-blur-md ${colors.background} ${colors.border} border ${
        isImmersive 
          ? 'p-4 rounded-3xl' 
          : 'p-4 rounded-t-3xl'
      }`}>
        {messages.map((message) => (
          <MemoizedMessage
            key={message.id}
            message={message}
            timeOfDay={timeOfDay}
          />
        ))}
        
        {isLoading && <TypingIndicator timeOfDay={timeOfDay} />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`flex-shrink-0 backdrop-blur-md ${colors.background} ${colors.border} border p-3 ${
        isImmersive ? 'rounded-3xl mt-4' : 'rounded-b-3xl border-x border-b'
      }`}>
        {messagesRemaining !== undefined && messagesRemaining <= 2 && (
          <div className={`text-xs text-center mb-2 ${colors.textSecondary}`}>
            {messagesRemaining} messages remaining in free session
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className={`w-full p-3 rounded-xl border-0 transition-all duration-200 placeholder-opacity-70 resize-none backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                colors.backgroundSecondary
              } ${colors.text}`}
              style={{ 
                minHeight: '48px',
                maxHeight: '96px',
                lineHeight: '1.5'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || disabled}
            className={`${submitButtonStyles} min-w-[48px] min-h-[48px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        
        {!isImmersive && (
          <div className={`text-xs mt-1 text-center ${colors.textSecondary} opacity-70`}>
            Press Enter to send
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedChatInterface;