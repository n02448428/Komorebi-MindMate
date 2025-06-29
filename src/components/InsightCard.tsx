import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { InsightCard as InsightCardType } from '../types';
import { Share2, Download, Copy, Check, Sparkles, X, Star } from 'lucide-react';
import html2canvas from 'html2canvas';

interface InsightCardProps {
  insight: InsightCardType;
  className?: string;
  isExpanded?: boolean;
  onClose?: () => void;
  onTogglePin?: (insightId: string) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  className = '',
  isExpanded = false,
  onClose,
  onTogglePin
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(insight.quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = insight.quote;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    
    setDownloading(true);
    try {
      const element = document.getElementById(`insight-card-${insight.id}`);
      if (!element) {
        throw new Error('Card element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        width: 400,
        height: 600,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      
      const link = document.createElement('a');
      link.download = `komorebi-insight-${insight.createdAt.toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
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
          console.error('Share failed:', error);
          handleCopy();
        }
      }
    } else {
      // Fallback for browsers without share API
      handleCopy();
    }
  };

  const handleTogglePin = () => {
    if (onTogglePin) {
      onTogglePin(insight.id);
    }
  };

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
        className={`relative w-full aspect-[2/3] rounded-2xl overflow-hidden transition-all duration-300 ${
          isExpanded 
            ? 'cursor-grab active:cursor-grabbing' 
            : 'cursor-pointer insight-card'
        }`}
        whileHover={!isExpanded ? { scale: 1.05 } : undefined}
      >
        {/* Background Image or Gradient */}
        {insight.videoStillUrl ? (
          <img 
            src={insight.videoStillUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
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
              <div className="absolute inset-0 rounded-2xl backdrop-blur-md bg-white/25 border border-white/30" />
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
            <button
              onClick={handleTogglePin}
              className={`p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 ${
                insight.isPinned
                  ? (insight.type === 'morning'
                      ? 'bg-amber-500/30 text-amber-700 border-amber-400/50'
                      : 'bg-purple-500/30 text-purple-300 border-purple-400/50')
                  : (insight.type === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white')
              }`}
              title={insight.isPinned ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={insight.isPinned ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-5 h-5 ${insight.isPinned ? 'fill-current' : ''}`} />
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className={`p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 ${
              insight.type === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Copy quote to clipboard"
            aria-label="Copy quote to clipboard"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleDownload}
            className={`p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 ${
              insight.type === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Download as image"
            aria-label="Download as image"
          >
            {downloading ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={handleShare}
            className={`p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 ${
              insight.type === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Share insight"
            aria-label="Share insight"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightCard;