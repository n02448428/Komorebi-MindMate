import React, { useState } from 'react';
import { InsightCard as InsightCardType } from '../types';
import { Share2, Download, Copy, Check, Sparkles, Star, Diamond, Crown, Zap } from 'lucide-react';
import { getSceneGradient, natureScenes } from '../utils/sceneUtils';
import html2canvas from 'html2canvas';

interface InsightCardProps {
  insight: InsightCardType;
  className?: string;
}

// Rarity system for cards
const getRarity = (cardId: string): { level: string; color: string; icon: any; border: string } => {
  const hash = cardId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rarityLevel = hash % 100;
  
  if (rarityLevel < 5) {
    return {
      level: 'Legendary',
      color: 'from-yellow-400 via-orange-500 to-red-500',
      icon: Crown,
      border: 'border-yellow-400/80 shadow-yellow-400/50'
    };
  } else if (rarityLevel < 15) {
    return {
      level: 'Epic',
      color: 'from-purple-400 via-pink-500 to-purple-600',
      icon: Diamond,
      border: 'border-purple-400/80 shadow-purple-400/50'
    };
  } else if (rarityLevel < 35) {
    return {
      level: 'Rare',
      color: 'from-blue-400 via-cyan-500 to-blue-600',
      icon: Star,
      border: 'border-blue-400/80 shadow-blue-400/50'
    };
  } else {
    return {
      level: 'Common',
      color: 'from-gray-300 via-gray-400 to-gray-500',
      icon: Sparkles,
      border: 'border-gray-400/80 shadow-gray-400/50'
    };
  }
};

// Generate unique card number
const getCardNumber = (cardId: string, type: 'morning' | 'evening'): string => {
  const hash = cardId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const prefix = type === 'morning' ? 'KM' : 'KE';
  const number = (hash % 999 + 1).toString().padStart(3, '0');
  return `${prefix}-${number}`;
};

const InsightCard: React.FC<InsightCardProps> = ({ insight, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const rarity = getRarity(insight.id);
  const cardNumber = getCardNumber(insight.id, insight.type);
  const sceneData = natureScenes[insight.sceneType];
  const gradientClass = getSceneGradient(insight.sceneType, insight.type);

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
      
      // Style the clone for better rendering
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      clone.style.width = '400px';
      clone.style.height = '560px'; // Trading card aspect ratio
      clone.style.transform = 'none';
      clone.style.zIndex = '-1';
      clone.style.fontFamily = 'Inter, system-ui, sans-serif';
      
      // Add to document temporarily
      document.body.appendChild(clone);
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(clone, {
        scale: 2,
        width: 400,
        height: 560,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        backgroundColor: null,
      });
      
      // Remove the clone
      document.body.removeChild(clone);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `komorebi-card-${cardNumber}-${insight.createdAt.toISOString().split('T')[0]}.png`;
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
    const shareData = {
      title: `Komorebi ${rarity.level} Card #${cardNumber}`,
      text: `"${insight.quote}" - Collected from ${insight.type === 'morning' ? 'Morning Intentions' : 'Evening Reflections'}`,
      url: window.location.origin,
    };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to share:', error);
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const RarityIcon = rarity.icon;

  return (
    <div className={`relative ${className}`}>
      {/* Trading Card */}
      <div
        id={`insight-card-${insight.id}`}
        className={`relative w-full aspect-[5/7] rounded-2xl overflow-hidden border-4 ${rarity.border} shadow-2xl transform-gpu`}
        style={{
          background: `linear-gradient(135deg, ${insight.type === 'morning' ? '#fef3c7, #fed7aa' : '#c7d2fe, #ddd6fe'})`,
        }}
      >
        {/* Holographic Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-60" />
        <div className={`absolute inset-0 bg-gradient-to-r ${rarity.color} opacity-10`} />
        
        {/* Background Scene Integration */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-30`} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }} />
        
        {/* Card Border Design */}
        <div className="absolute inset-2 border-2 border-white/30 rounded-xl" />
        <div className="absolute inset-4 border border-white/20 rounded-lg" />
        
        {/* Top Section */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="flex justify-between items-start">
            {/* Card Number */}
            <div className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/30 ${
              insight.type === 'morning' ? 'bg-amber-500/20 text-amber-800' : 'bg-purple-500/20 text-purple-800'
            }`}>
              #{cardNumber}
            </div>
            
            {/* Rarity Indicator */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/30 bg-gradient-to-r ${rarity.color} text-white`}>
              <RarityIcon className="w-3 h-3" />
              {rarity.level}
            </div>
          </div>
          
          {/* Title */}
          <div className="mt-3 text-center">
            <h3 className={`text-lg font-bold ${
              insight.type === 'morning' ? 'text-amber-800' : 'text-purple-800'
            }`}>
              {insight.type === 'morning' ? 'Morning Insight' : 'Evening Reflection'}
            </h3>
            <div className={`text-xs font-medium mt-1 ${
              insight.type === 'morning' ? 'text-amber-600' : 'text-purple-600'
            }`}>
              {sceneData.name}
            </div>
          </div>
        </div>

        {/* Center Quote Section */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pt-20 pb-16">
          <div className="relative">
            {/* Quote Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${
              insight.type === 'morning' 
                ? 'from-white/40 to-amber-100/40' 
                : 'from-white/40 to-purple-100/40'
            } rounded-2xl backdrop-blur-sm border border-white/40 shadow-lg`} />
            
            {/* Quote Content */}
            <div className="relative p-4">
              <div className={`text-3xl font-bold mb-2 ${
                insight.type === 'morning' ? 'text-amber-600' : 'text-purple-600'
              }`}>
                "
              </div>
              <blockquote className={`text-sm font-medium leading-relaxed text-center ${
                insight.type === 'morning' ? 'text-gray-800' : 'text-gray-800'
              } px-2`}>
                {insight.quote}
              </blockquote>
              <div className={`text-3xl font-bold mt-2 text-right ${
                insight.type === 'morning' ? 'text-amber-600' : 'text-purple-600'
              }`}>
                "
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex justify-between items-end">
            {/* Date */}
            <div className={`text-xs font-medium ${
              insight.type === 'morning' ? 'text-amber-700' : 'text-purple-700'
            }`}>
              {insight.createdAt.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            
            {/* Komorebi Branding */}
            <div className={`flex items-center gap-1 text-xs font-bold ${
              insight.type === 'morning' ? 'text-amber-700' : 'text-purple-700'
            }`}>
              <Sparkles className="w-3 h-3" />
              KOMOREBI
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="mt-2 flex justify-center">
            <div className={`flex items-center gap-3 px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-white/30 ${
              insight.type === 'morning' ? 'bg-amber-500/20 text-amber-800' : 'bg-purple-500/20 text-purple-800'
            }`}>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Wisdom</span>
              </div>
              <div className="w-px h-3 bg-current opacity-30" />
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>{insight.type === 'morning' ? 'Intent' : 'Reflect'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-2 left-2">
          <div className={`w-6 h-6 border-l-2 border-t-2 rounded-tl-lg ${
            insight.type === 'morning' ? 'border-amber-400' : 'border-purple-400'
          }`} />
        </div>
        <div className="absolute top-2 right-2">
          <div className={`w-6 h-6 border-r-2 border-t-2 rounded-tr-lg ${
            insight.type === 'morning' ? 'border-amber-400' : 'border-purple-400'
          }`} />
        </div>
        <div className="absolute bottom-2 left-2">
          <div className={`w-6 h-6 border-l-2 border-b-2 rounded-bl-lg ${
            insight.type === 'morning' ? 'border-amber-400' : 'border-purple-400'
          }`} />
        </div>
        <div className="absolute bottom-2 right-2">
          <div className={`w-6 h-6 border-r-2 border-b-2 rounded-br-lg ${
            insight.type === 'morning' ? 'border-amber-400' : 'border-purple-400'
          }`} />
        </div>

        {/* Premium Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50 pointer-events-none" 
             style={{
               background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
               animation: 'shine 3s ease-in-out infinite'
             }} />
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
          title="Download trading card"
          aria-label="Download insight card as trading card image"
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
          title="Share trading card"
          aria-label="Share insight trading card"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default InsightCard;