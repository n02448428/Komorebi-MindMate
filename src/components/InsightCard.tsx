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
      // Fallback for older browsers
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
        alert(`Copy this text: "${insight.quote}"`);
      } finally {
        document.body.removeChild(textArea);
      }
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
      
      // Remove backdrop-filter properties that cause issues with html2canvas
      const removeBackdropFilters = (el: HTMLElement) => {
        el.style.backdropFilter = 'none';
        (el.style as any).webkitBackdropFilter = 'none';
        
        // Remove backdrop-blur classes
        if (el.classList.contains('backdrop-blur-sm')) {
          el.classList.remove('backdrop-blur-sm');
        }
        
        // Recursively apply to all children
        Array.from(el.children).forEach(child => {
          removeBackdropFilters(child as HTMLElement);
        });
      };
      
      // Style the clone for better rendering
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.opacity = '0';
      clone.style.zIndex = '-1';
      clone.style.fontFamily = 'Inter, system-ui, sans-serif';
      
      // Remove problematic backdrop filters
      removeBackdropFilters(clone);
      
      // Add to document temporarily
      document.body.appendChild(clone);
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        backgroundColor: '#FFFFFF', // White background for debugging
        onclone: (clonedDoc) => {
          // Ensure all fonts are loaded in the cloned document
          const clonedElement = clonedDoc.getElementById(`insight-card-clone-${insight.id}`);
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Inter, system-ui, sans-serif';
            // Force all text elements to use the correct font
            const textElements = clonedElement.querySelectorAll('*');
            textElements.forEach(el => {
              (el as HTMLElement).style.fontFamily = 'Inter, system-ui, sans-serif';
            });
          }
        }
      });
      
      // Remove the clone
      document.body.removeChild(clone);
      
      // Verify canvas has content
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas is empty');
      }
      
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
    if (navigator.share && navigator.canShare && navigator.canShare()) {
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

export default InsightCard;