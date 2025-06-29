import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Sparkles } from 'lucide-react';

interface InsightCardProps {
  title: string;
  content: string;
  timestamp: string;
  sessionType?: 'morning' | 'evening' | 'meditation';
  onClick?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  content,
  timestamp,
  sessionType = 'morning',
  onClick
}) => {
  const getSessionTypeGradient = () => {
    switch (sessionType) {
      case 'morning':
        return 'from-amber-200/20 via-orange-100/10 to-yellow-200/20';
      case 'evening':
        return 'from-purple-900/30 via-indigo-800/20 to-blue-900/30';
      case 'meditation':
        return 'from-emerald-200/20 via-teal-100/10 to-cyan-200/20';
      default:
        return 'from-blue-200/20 via-cyan-100/10 to-teal-200/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`p-6 rounded-xl backdrop-blur-sm border border-white/20 bg-gradient-to-br ${getSessionTypeGradient()} cursor-pointer hover:bg-white/10 transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-1 text-white/60 text-sm">
          <Clock className="w-4 h-4" />
          <span>{timestamp}</span>
        </div>
      </div>
      
      <p className="text-white/80 leading-relaxed mb-4">{content}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-white/60 text-sm">
          <Calendar className="w-4 h-4" />
          <span className="capitalize">{sessionType} session</span>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightCard;