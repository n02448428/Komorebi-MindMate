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
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(insight.quote);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = insight.quote;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          // Show the text in an alert as last resort
          alert(`Copy this text: "${insight.quote}"`);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      // Show the text in an alert as fallback
      alert(`Copy this text: "${insight.quote}"`);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById(`insight-card-${insight.id}`);
      if (!element) {
        throw new Error('Card element not found');
      }

      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create a clone of the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      clone.id = `insight-card-clone-${insight.id}`;
      
      // Style the clone for better rendering
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      clone.style.width = '800px';
      clone.style.height = '600px';
      clone.style.transform = 'none';
      clone.style.zIndex = '-1';
      
      // Add to document temporarily
      document.body.appendChild(clone);
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(clone, {
        backgroundColor: getBackgroundColor(insight.sceneType, insight.type),
        scale: 2,
        width: 800,
        height: 600,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Ensure all fonts are loaded
          const clonedElement = clonedDoc.getElementById(`insight-card-clone-${insight.id}`);
          if (clonedElement) {
            // Force font loading
            clonedElement.style.fontFamily = 'Inter, system-ui, sans-serif';
            // Ensure background is solid
            clonedElement.style.background = getBackgroundColor(insight.sceneType, insight.type);
          }
        }
      });
      
      // Remove the clone
      document.body.removeChild(clone);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `komorebi-insight-${insight.createdAt.toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Failed to download image. Please try again or check your browser permissions.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: 'Komorebi MindMate Insight',
          text: insight.quote,
          url: window.location.origin,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to share:', error);
          handleCopy(); // Fallback to copy
        }
      }
    } else {
      handleCopy(); // Fallback to copy
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
          // Ensure solid background for html2canvas
          background: getBackgroundColor(insight.sceneType, insight.type)
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full translate-y-24 -translate-x-24" />
        </div>
        
        {/* Content */}
        <div className="relative p-6 md:p-8 h-full flex flex-col justify-between z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 md:w-6 md:h-6 ${
                insight.type === 'morning' ? 'text-amber-600' : 'text-purple-300'
              }`} />
              <span className={`text-xs md:text-sm font-medium ${
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
          <div className="flex-1 flex items-center justify-center px-2 md:px-4">
            <blockquote className={`text-lg md:text-xl lg:text-2xl font-medium leading-relaxed text-center ${
              insight.type === 'morning' ? 'text-gray-800' : 'text-white'
            } drop-shadow-sm max-w-full`}>
              "{insight.quote}"
            </blockquote>
          </div>

          {/* Footer */}
          <div className={`text-xs md:text-sm text-center ${
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
          } border border-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30`}
          title="Copy quote to clipboard"
          aria-label="Copy quote to clipboard"
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
          } border border-white/20 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/30`}
          title="Download as image"
          aria-label="Download insight card as image"
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
          } border border-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30`}
          title="Share insight"
          aria-label="Share insight"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Helper function to get solid background colors for html2canvas
const getBackgroundColor = (scene: string, timeOfDay: 'morning' | 'evening'): string => {
  const backgrounds = {
    ocean: {
      morning: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
      evening: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 100%)'
    },
    forest: {
      morning: 'linear-gradient(135deg, #dcfce7 0%, #a7f3d0 100%)',
      evening: 'linear-gradient(135deg, #14532d 0%, #064e3b 100%)'
    },
    desert: {
      morning: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)',
      evening: 'linear-gradient(135deg, #9a3412 0%, #581c87 100%)'
    },
    mountain: {
      morning: 'linear-gradient(135deg, #f8fafc 0%, #bfdbfe 100%)',
      evening: 'linear-gradient(135deg, #111827 0%, #312e81 100%)'
    },
    lake: {
      morning: 'linear-gradient(135deg, #f0fdfa 0%, #a5f3fc 100%)',
      evening: 'linear-gradient(135deg, #1e3a8a 0%, #581c87 100%)'
    },
    meadow: {
      morning: 'linear-gradient(135deg, #f0fdf4 0%, #fde047 100%)',
      evening: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)'
    }
  };
  
  return backgrounds[scene as keyof typeof backgrounds]?.[timeOfDay] || backgrounds.ocean[timeOfDay];
};

export default InsightCard;