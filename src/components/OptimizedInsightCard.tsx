/**
 * Optimized InsightCard component
 * Performance Improvements:
 * - Memoized animations and calculations
 * - Lazy loading for images
 * - Optimized event handlers
 * - Reduced DOM manipulations
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { InsightCard as InsightCardType } from '../types';
import { Share2, Download, Copy, Check, Sparkles, X, Star } from 'lucide-react';
import { getThemeColors } from '../utils/styleUtils';

interface OptimizedInsightCardProps {
  insight: InsightCardType;
  className?: string;
  isExpanded?: boolean;
  onClose?: () => void;
  onTogglePin?: (insightId: string) => void;
}

// Memoized action button component
const ActionButton = React.memo<{
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  variant?: 'default' | 'active';
  timeOfDay: 'morning' | 'evening';
}>(({ onClick, icon, title, variant = 'default', timeOfDay }) => {
  const colors = getThemeColors(timeOfDay);
  
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 ${
        variant === 'active'
          ? (timeOfDay === 'morning'
              ? 'bg-amber-500/30 text-amber-700 border-amber-500/50'
              : 'bg-purple-500/30 text-purple-300 border-purple-500/50')
          : `${colors.background} hover:${colors.secondary.split(' ')[1]} ${colors.text}`
      }`}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
});

export const OptimizedInsightCard: React.FC<OptimizedInsightCardProps> = ({
  insight,
  className = '',
  isExpanded = false,
  onClose,
  onTogglePin
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Memoize theme colors
  const colors = useMemo(() => getThemeColors(insight.type), [insight.type]);
  
  // Motion values for 3D effect (only when expanded)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Memoized transforms to prevent recalculation
  const rotateX = useMemo(() => 
    useTransform(mouseY, [-150, 150], [15, -15]), 
    [mouseY]
  );
  const rotateY = useMemo(() => 
    useTransform(mouseX, [-150, 150], [-15, 15]), 
    [mouseX]
  );

  // Optimized mouse move handler
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isExpanded || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  }, [isExpanded, mouseX, mouseY]);

  // Reset mouse position on leave
  const handleMouseLeave = useCallback(() => {
    if (!isExpanded) return;
    mouseX.set(0);
    mouseY.set(0);
  }, [isExpanded, mouseX, mouseY]);

  // Optimized copy handler with error handling
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(insight.quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Clipboard API failed, using fallback', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = insight.quote;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('All copy methods failed', fallbackError);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }, [insight.quote]);

  // Optimized download handler
  const handleDownload = useCallback(async () => {
    if (downloading) return;
    
    setDownloading(true);
    try {
      const element = document.getElementById(`insight-card-${insight.id}`);
      if (!element) {
        throw new Error('Card element not found');
      }

      // Dynamic import for html2canvas to reduce bundle size
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        width: 400,
        height: 600,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `komorebi-insight-${insight.createdAt.toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [insight.id, insight.createdAt, downloading]);

  // Optimized share handler
  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'Komorebi MindMate Insight',
      text: insight.quote,
      url: window.location.origin,
    };
    
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.warn('Share failed, falling back to copy', error);
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  }, [insight.quote, handleCopy]);

  // Optimized pin toggle handler
  const handleTogglePin = useCallback(() => {
    if (onTogglePin) {
      onTogglePin(insight.id);
    }
  }, [onTogglePin, insight.id]);

  // Memoized responsive scale calculation
  const responsiveScale = useMemo(() => {
    if (!isExpanded) return 1;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const baseWidth = 400;
    const baseHeight = 600;
    const marginX = 100;
    const marginY = 100;
    
    const scaleX = (viewportWidth - marginX) / baseWidth;
    const scaleY = (viewportHeight - marginY) / baseHeight;
    
    return Math.min(Math.max(Math.min(scaleX, scaleY), 0.8), 2.0);
  }, [isExpanded]);

  return (
    <div className={className}>
      {/* Close button for expanded view */}
      {isExpanded && onClose && (
        <button
          onClick={onClose}
          className="fixed top-6 right-6 z-[110] p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200"
          aria-label="Close expanded view"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Card Container */}
      <motion.div
        ref={cardRef}
        id={`insight-card-${insight.id}`}
        drag={isExpanded}
        dragElastic={0.1}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={isExpanded ? {
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        } : {}}
        className={`relative w-full aspect-[2/3] rounded-2xl overflow-hidden transition-all duration-300 ${
          isExpanded 
            ? 'cursor-grab active:cursor-grabbing' 
            : 'cursor-pointer insight-card'
        }`}
        whileHover={!isExpanded ? { 
          scale: 1.05, 
          rotateY: 5,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        } : {}}
        animate={isExpanded ? { scale: responsiveScale } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Background Image */}
        {insight.videoStillUrl ? (
          <img 
            src={insight.videoStillUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${
            insight.type === 'morning' 
              ? 'from-amber-300/40 via-orange-200/30 to-yellow-200/40' 
              : 'from-purple-400/40 via-indigo-300/30 to-blue-400/40'
          }`} />
        )}

        {/* Content Container */}
        <div className="relative h-full flex flex-col justify-between p-6 backdrop-blur-sm bg-black/10">
          {/* Header */}
          <div className="text-center">
            <div className="text-lg font-bold mb-2 text-white">Komorebi</div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm border border-white/30 ${
              insight.type === 'morning' 
                ? 'bg-amber-500/20 text-amber-100' 
                : 'bg-purple-500/20 text-purple-100'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {insight.type === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
              </span>
            </div>
          </div>

          {/* Quote Section */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative max-w-full">
              <div className="absolute inset-0 rounded-2xl backdrop-blur-md border border-white/30 bg-white/50" />
              <div className="relative p-6">
                <blockquote className="text-lg font-medium leading-relaxed text-center text-gray-900">
                  "{insight.quote}"
                </blockquote>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="text-sm font-medium text-white">
              {insight.createdAt.toLocaleDateString([], {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons (only shown when not expanded) */}
      {!isExpanded && (
        <div className="flex justify-center gap-3 mt-6">
          {onTogglePin && (
            <ActionButton
              onClick={handleTogglePin}
              icon={<Star className={`w-5 h-5 ${insight.isPinned ? 'fill-current' : ''}`} />}
              title={insight.isPinned ? 'Remove from favorites' : 'Add to favorites'}
              variant={insight.isPinned ? 'active' : 'default'}
              timeOfDay={insight.type}
            />
          )}
          
          <ActionButton
            onClick={handleCopy}
            icon={copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            title="Copy quote to clipboard"
            timeOfDay={insight.type}
          />
          
          <ActionButton
            onClick={handleDownload}
            icon={downloading ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            title="Download as image"
            timeOfDay={insight.type}
          />
          
          <ActionButton
            onClick={handleShare}
            icon={<Share2 className="w-5 h-5" />}
            title="Share insight"
            timeOfDay={insight.type}
          />
        </div>
      )}
    </div>
  );
};

export default OptimizedInsightCard;