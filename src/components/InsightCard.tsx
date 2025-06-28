import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { InsightCard as InsightCardType } from '../types';
import { Share2, Download, Copy, Check, Sparkles } from 'lucide-react';
import { natureScenes } from '../utils/sceneUtils';
import html2canvas from 'html2canvas';

interface InsightCardProps {
  insight: InsightCardType;
  className?: string;
  isExpanded?: boolean;
  onClose?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ 
  insight, 
  className = '', 
  isExpanded = false,
  onClose 
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to rotation values
  const rotateX = useTransform(mouseY, [-150, 150], [15, -15]);
  const rotateY = useTransform(mouseX, [-150, 150], [-15, 15]);

  // Holographic effect transforms
  const holographicX = useTransform(mouseX, [-150, 150], [0, 100]);
  const holographicY = useTransform(mouseY, [-150, 150], [0, 100]);

  // Parallax effect transforms
  const parallaxX = useTransform(mouseX, [-150, 150], [-5, 5]);
  const parallaxY = useTransform(mouseY, [-150, 150], [-5, 5]);

  const sceneData = natureScenes[insight.sceneType];
  
  // Debug log for background image selection
  console.log('InsightCard background selection:', {
    insightId: insight.id,
    hasVideoStill: !!insight.videoStillUrl,
    videoStillLength: insight.videoStillUrl?.length,
    thumbnailUrl: sceneData.thumbnailUrl,
    selectedUrl: insight.videoStillUrl || sceneData.thumbnailUrl
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isExpanded || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    if (!isExpanded) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(insight.quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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

      await new Promise(resolve => setTimeout(resolve, 300));
      
      const clone = element.cloneNode(true) as HTMLElement;
      clone.id = `insight-card-clone-${insight.id}`;
      
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      clone.style.width = '400px';
      clone.style.height = '600px';
      clone.style.transform = 'none';
      clone.style.zIndex = '-1';
      
      document.body.appendChild(clone);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(clone, {
        scale: 2,
        width: 400,
        height: 600,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: null,
      });
      
      document.body.removeChild(clone);
      
      const link = document.createElement('a');
      link.download = `komorebi-insight-${insight.createdAt.toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Failed to download:', error);
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

  return (
    <div className={className}>
      {/* Trading Card */}
      <motion.div
        ref={cardRef}
        id={`insight-card-${insight.id}`}
        drag={isExpanded}
        dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={isExpanded ? {
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        } : {}}
        className={`relative w-full aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
          isExpanded ? 'z-50' : 'hover:scale-105 hover:shadow-2xl'
        }`}
        whileHover={!isExpanded ? { scale: 1.05, rotateY: 5 } : {}}
        animate={isExpanded ? { scale: 1.2 } : { scale: 1 }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${insight.videoStillUrl || sceneData.thumbnailUrl})`,
          }}
        />

        {/* Background Overlay */}
        <div className={`absolute inset-0 ${
          insight.type === 'morning' 
            ? 'bg-gradient-to-br from-amber-300/40 via-orange-200/30 to-yellow-200/40' 
            : 'bg-gradient-to-br from-purple-400/40 via-indigo-300/30 to-blue-400/40'
        }`} />

        {/* Holographic Foil Effect (only when expanded) */}
        {isExpanded && (
          <motion.div
            className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${holographicX}% ${holographicY}%, 
                #ff0080 0%, #ff8c00 16%, #40e0d0 32%, #9370db 48%, #00ff7f 64%, #ffd700 80%, #ff0080 100%)`,
              backgroundSize: '200% 200%',
            }}
          />
        )}

        {/* Content Container with Parallax */}
        <motion.div 
          className="relative h-full flex flex-col justify-between p-6"
          style={isExpanded ? { x: parallaxX, y: parallaxY } : {}}
        >
          {/* Header */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm border border-white/30 ${
              insight.type === 'morning' 
                ? 'bg-amber-500/20 text-amber-800' 
                : 'bg-purple-500/20 text-purple-800'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {insight.type === 'morning' ? 'Morning Insight' : 'Evening Reflection'}
              </span>
            </div>
          </div>

          {/* Quote Section */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative max-w-full">
              {/* Quote Background with deeper parallax */}
              <motion.div 
                className={`absolute inset-0 rounded-2xl backdrop-blur-md border border-white/30 ${
                  insight.type === 'morning' 
                    ? 'bg-white/60' 
                    : 'bg-white/50'
                }`}
                style={isExpanded ? { 
                  x: useTransform(parallaxX, [0, 5], [0, 2]), 
                  y: useTransform(parallaxY, [0, 5], [0, 2]) 
                } : {}}
              />
              
              {/* Quote Content */}
              <div className="relative p-6">
                <blockquote className={`text-lg font-medium leading-relaxed text-center ${
                  insight.type === 'morning' ? 'text-gray-800' : 'text-gray-900'
                }`}>
                  "{insight.quote}"
                </blockquote>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className={`text-sm font-medium ${
              insight.type === 'morning' ? 'text-amber-700' : 'text-purple-700'
            }`}>
              {insight.createdAt.toLocaleDateString([], {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </motion.div>

        {/* Shine Effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-40 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
            transform: isExpanded ? 'translateX(100%)' : 'translateX(-100%)',
            transition: 'transform 2s ease-in-out',
          }}
        />
      </motion.div>

      {/* Action Buttons (only shown when not expanded) */}
      {!isExpanded && (
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
      )}
    </div>
  );
};

export default InsightCard;