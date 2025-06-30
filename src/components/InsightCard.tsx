/**
 * InsightCard component
 * Displays a beautiful card with a quote/insight from the user's conversation
 * Features:
 * - Interactive 3D effects
 * - Download and share capabilities
 * - Pin/favorite functionality
 * - Scene background from user's session
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { InsightCard as InsightCardType } from '../types';
import { Share2, Download, Copy, Check, Sparkles, X, Star, Trash2 } from 'lucide-react';
import { natureScenes } from '../utils/sceneUtils';

interface InsightCardProps {
  insight: InsightCardType;
  className?: string;
  isExpanded?: boolean;
  onClose?: () => void;
  onTogglePin?: (insightId: string) => void;
  onDelete?: (event: React.MouseEvent) => void;
  isDeleting?: boolean;
}

// Memoized action button component
const ActionButton = React.memo<{
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  title: string;
  variant?: 'default' | 'danger' | 'active';
  disabled?: boolean;
  timeOfDay: 'morning' | 'evening';
}>(({ onClick, icon, title, variant = 'default', disabled = false, timeOfDay }) => {
  // Get button styles based on variant and time of day
  const getButtonStyles = () => {
    const baseStyles = `p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:hover:scale-100`;
    
    if (variant === 'danger') {
      return `${baseStyles} ${
        timeOfDay === 'morning'
          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-700 border-red-300/50'
          : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-600/30'
      }`;
    }
    
    if (variant === 'active') {
      return `${baseStyles} ${
        timeOfDay === 'morning'
          ? 'bg-amber-500/30 text-amber-700 border-amber-500/50'
          : 'bg-purple-500/30 text-purple-300 border-purple-500/50'
      }`;
    }
    
    return `${baseStyles} ${
      timeOfDay === 'morning'
        ? 'bg-white/20 hover:bg-white/30 text-gray-700'
        : 'bg-white/10 hover:bg-white/20 text-white'
    }`;
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonStyles()}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
});

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  className = '',
  isExpanded = false,
  onClose,
  onTogglePin,
  onDelete,
  isDeleting = false
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Get scene data for the insight
  const sceneData = useMemo(() => 
    natureScenes[insight.sceneType], 
    [insight.sceneType]
  );
  
  // Motion values for 3D effect (only when expanded)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform hooks for 3D effect and holographic foil
  const rotateX = useTransform(mouseY, [-150, 150], [15, -15]);
  const rotateY = useTransform(mouseX, [-150, 150], [-15, 15]);
  const holographicX = useTransform(mouseX, [-150, 150], [0, 100]);
  const holographicY = useTransform(mouseY, [-150, 150], [0, 100]);

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
  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
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
  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
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
  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
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
          handleCopy(e);
        }
      }
    } else {
      handleCopy(e);
    }
  }, [insight.quote, handleCopy]);

  // Optimized pin toggle handler
  const handleTogglePin = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
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
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
          style={{
            backgroundImage: `url(${insight.videoStillUrl || sceneData.thumbnailUrl})`,
          }}
        />

        {/* Background Overlay Gradient */}
        <div className={`absolute inset-0 ${
          insight.type === 'morning' 
            ? 'bg-gradient-to-br from-amber-300/40 via-orange-200/30 to-yellow-200/40' 
            : 'bg-gradient-to-br from-purple-400/40 via-indigo-300/30 to-blue-400/40'
        }`} />

        {/* Holographic Foil Effect (only when expanded) */}
        {isExpanded && (
          <motion.div
            className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
            style={{
              backgroundPosition: `${holographicX}% ${holographicY}%`,
              background: 'linear-gradient(45deg, #ff0080 0%, #ff8c00 16%, #40e0d0 32%, #9370db 48%, #00ff7f 64%, #ffd700 80%, #ff0080 100%)',
              backgroundSize: '200% 200%',
            }}
          />
        )}

        {/* Content Container */}
        <div className="relative h-full flex flex-col justify-between p-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-lg font-bold mb-2 text-white">
              Komorebi
            </div>
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

        {/* Shine Effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
            opacity: 0.3,
          }}
        />

        {/* Premium border glow effect when expanded */}
        {isExpanded && (
          <div className={`absolute inset-0 rounded-2xl pointer-events-none ${
            insight.type === 'morning'
              ? 'rarity-legendary'
              : 'rarity-epic'
          }`} />
        )}
      </motion.div>

      {/* Action Buttons (only shown when not expanded) */}
      {!isExpanded && (
        <div className="flex justify-center gap-2 mt-6">
          {/* Pin/Favorite Button */}
          {onTogglePin && (
            <ActionButton
              onClick={handleTogglePin}
              icon={<Star className={`w-5 h-5 ${insight.isPinned ? 'fill-current' : ''}`} />}
              title={insight.isPinned ? 'Remove from favorites' : 'Add to favorites'}
              variant={insight.isPinned ? 'active' : 'default'}
              timeOfDay={insight.type}
            />
          )}
          
          {/* Delete Button */}
          {onDelete && (
            <ActionButton
              onClick={onDelete}
              icon={isDeleting ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              title="Delete insight"
              variant="danger"
              disabled={isDeleting}
              timeOfDay={insight.type}
            />
          )}
          
          {/* Copy Button */}
          <ActionButton
            onClick={handleCopy}
            icon={copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            title="Copy quote to clipboard"
            timeOfDay={insight.type}
          />
          
          {/* Download Button */}
          <ActionButton
            onClick={handleDownload}
            icon={downloading ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            title="Download as image"
            disabled={downloading}
            timeOfDay={insight.type}
          />
          
          {/* Share Button */}
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

export default InsightCard;