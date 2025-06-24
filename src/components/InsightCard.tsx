import React, { useState } from 'react';
import { InsightCard as InsightCardType } from '../types';
import { Share2, Download, Copy, Check, Sparkles } from 'lucide-react';
import { getSceneGradient } from '../utils/sceneUtils';
import html2canvas from 'html2canvas';

interface InsightCardProps {
  insight: InsightCardType;
  className?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(insight.quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById(`insight-card-${insight.id}`);
      if (element) {
        // Wait a moment for any animations or transitions to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true,
          logging: false,
          // Remove fixed width/height to let html2canvas determine optimal size
          onclone: (clonedDoc) => {
            // Ensure all styles are properly applied in the cloned document
            const clonedElement = clonedDoc.getElementById(`insight-card-${insight.id}`);
            if (clonedElement) {
              // Force a repaint to ensure all styles are applied
              clonedElement.style.transform = 'translateZ(0)';
            }
          }
        });
        
        const link = document.createElement('a');
        link.download = `komorebi-insight-${insight.createdAt.toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      }
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Komorebi MindMate Insight',
          text: insight.quote,
          url: window.location.origin,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      handleCopy();
    }
  };

  const gradientClass = getSceneGradient(insight.sceneType, insight.type);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Downloadable Card */}
      <div
        id={`insight-card-${insight.id}`}
        className={`relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br ${gradientClass} backdrop-blur-sm border border-white/20 shadow-xl`}
        style={{
          // Ensure the card has a solid background for html2canvas
          background: `linear-gradient(to bottom right, ${getGradientColors(insight.sceneType, insight.type)})`
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
        </div>
        
        {/* Content */}
        <div className="relative p-8 h-full flex flex-col justify-between z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-6 h-6 ${
                insight.type === 'morning' ? 'text-amber-600' : 'text-purple-300'
              }`} />
              <span className={`text-sm font-medium ${
                insight.type === 'morning' ? 'text-gray-700' : 'text-white/90'
              }`}>
                {insight.type === 'morning' ? 'Morning Insight' : 'Evening Reflection'}
              </span>
            </div>
            
            <div className={`text-xs ${
              insight.type === 'morning' ? 'text-gray-600' : 'text-white/70'
            }`}>
              Komorebi MindMate
            </div>
          </div>

          {/* Quote */}
          <div className="flex-1 flex items-center justify-center px-4">
            <blockquote className={`text-xl md:text-2xl font-medium leading-relaxed text-center ${
              insight.type === 'morning' ? 'text-gray-800' : 'text-white'
            } drop-shadow-sm`}>
              "{insight.quote}"
            </blockquote>
          </div>

          {/* Footer */}
          <div className={`text-sm text-center ${
            insight.type === 'morning' ? 'text-gray-600' : 'text-white/70'
          }`}>
            {insight.createdAt.toLocaleDateString([], {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={handleCopy}
          className={`p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm ${
            insight.type === 'morning'
              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
              : 'bg-white/10 hover:bg-white/20 text-white'
          } border border-white/20 hover:scale-105`}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm ${
            insight.type === 'morning'
              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
              : 'bg-white/10 hover:bg-white/20 text-white'
          } border border-white/20 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100`}
          title="Download image"
        >
          {downloading ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Download className="w-5 h-5" />
          )}
        </button>
        
        <button
          onClick={handleShare}
          className={`p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm ${
            insight.type === 'morning'
              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
              : 'bg-white/10 hover:bg-white/20 text-white'
          } border border-white/20 hover:scale-105`}
          title="Share insight"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Helper function to get solid gradient colors for html2canvas
const getGradientColors = (scene: string, timeOfDay: 'morning' | 'evening'): string => {
  const gradients = {
    ocean: {
      morning: 'rgba(219, 234, 254, 0.2), rgba(147, 197, 253, 0.2)',
      evening: 'rgba(30, 27, 75, 0.3), rgba(88, 28, 135, 0.3)'
    },
    forest: {
      morning: 'rgba(220, 252, 231, 0.2), rgba(167, 243, 208, 0.2)',
      evening: 'rgba(20, 83, 45, 0.3), rgba(6, 78, 59, 0.3)'
    },
    desert: {
      morning: 'rgba(254, 243, 199, 0.2), rgba(253, 224, 71, 0.2)',
      evening: 'rgba(154, 52, 18, 0.3), rgba(88, 28, 135, 0.3)'
    },
    mountain: {
      morning: 'rgba(248, 250, 252, 0.2), rgba(191, 219, 254, 0.2)',
      evening: 'rgba(17, 24, 39, 0.3), rgba(49, 46, 129, 0.3)'
    },
    lake: {
      morning: 'rgba(240, 253, 250, 0.2), rgba(165, 243, 252, 0.2)',
      evening: 'rgba(30, 58, 138, 0.3), rgba(88, 28, 135, 0.3)'
    },
    meadow: {
      morning: 'rgba(240, 253, 244, 0.2), rgba(253, 224, 71, 0.2)',
      evening: 'rgba(6, 78, 59, 0.3), rgba(15, 118, 110, 0.3)'
    }
  };
  
  return gradients[scene as keyof typeof gradients]?.[timeOfDay] || gradients.ocean[timeOfDay];
};

export default InsightCard;