/**
 * Shared styling utilities to reduce code duplication
 * Performance: Eliminates repeated inline style calculations
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  background: string;
  backgroundSecondary: string;
  border: string;
}

// Memoized theme configurations to prevent recalculation
export const getThemeColors = (() => {
  const cache = new Map<string, ThemeColors>();
  
  return (timeOfDay: 'morning' | 'evening'): ThemeColors => {
    if (cache.has(timeOfDay)) {
      return cache.get(timeOfDay)!;
    }
    
    const colors: ThemeColors = timeOfDay === 'morning' ? {
      primary: 'bg-amber-500 hover:bg-amber-600',
      secondary: 'bg-white/20 hover:bg-white/30',
      accent: 'text-amber-600',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      background: 'bg-white/20',
      backgroundSecondary: 'bg-white/10',
      border: 'border-white/20'
    } : {
      primary: 'bg-purple-600 hover:bg-purple-700',
      secondary: 'bg-white/10 hover:bg-white/20',
      accent: 'text-purple-400',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      background: 'bg-white/10',
      backgroundSecondary: 'bg-black/20',
      border: 'border-white/20'
    };
    
    cache.set(timeOfDay, colors);
    return colors;
  };
})();

/**
 * Generate consistent button styles
 * Performance: Reduces runtime style calculations
 */
export const getButtonStyles = (
  variant: 'primary' | 'secondary' | 'ghost',
  timeOfDay: 'morning' | 'evening',
  size: 'sm' | 'md' | 'lg' = 'md'
): string => {
  const colors = getThemeColors(timeOfDay);
  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const baseStyles = `${sizes[size]} rounded-xl font-medium transition-all duration-200 backdrop-blur-sm ${colors.border} border`;
  
  switch (variant) {
    case 'primary':
      return `${baseStyles} ${colors.primary} text-white`;
    case 'secondary':
      return `${baseStyles} ${colors.secondary} ${colors.text}`;
    case 'ghost':
      return `${baseStyles} ${colors.backgroundSecondary} ${colors.textSecondary}`;
    default:
      return baseStyles;
  }
};

/**
 * Consistent card container styles
 */
export const getCardStyles = (timeOfDay: 'morning' | 'evening'): string => {
  const colors = getThemeColors(timeOfDay);
  return `backdrop-blur-sm ${colors.background} ${colors.border} border rounded-2xl`;
};

/**
 * Generate gradient backgrounds based on scene and time
 * Performance: Cached gradient calculations
 */
const gradientCache = new Map<string, string>();

export const getSceneGradient = (scene: string, timeOfDay: 'morning' | 'evening'): string => {
  const key = `${scene}-${timeOfDay}`;
  
  if (gradientCache.has(key)) {
    return gradientCache.get(key)!;
  }
  
  const gradients: Record<string, Record<string, string>> = {
    ocean: {
      morning: 'from-blue-100/20 via-cyan-50/20 to-blue-200/20',
      evening: 'from-indigo-900/30 via-blue-800/30 to-purple-900/30'
    },
    forest: {
      morning: 'from-green-100/20 via-emerald-50/20 to-green-200/20',
      evening: 'from-green-900/30 via-emerald-800/30 to-green-900/30'
    },
    desert: {
      morning: 'from-orange-100/20 via-amber-50/20 to-yellow-200/20',
      evening: 'from-orange-900/30 via-red-800/30 to-purple-900/30'
    },
    mountain: {
      morning: 'from-gray-100/20 via-slate-50/20 to-blue-200/20',
      evening: 'from-gray-900/30 via-slate-800/30 to-indigo-900/30'
    },
    lake: {
      morning: 'from-blue-100/20 via-teal-50/20 to-cyan-200/20',
      evening: 'from-blue-900/30 via-indigo-800/30 to-purple-900/30'
    },
    meadow: {
      morning: 'from-green-100/20 via-lime-50/20 to-yellow-200/20',
      evening: 'from-green-900/30 via-emerald-800/30 to-teal-900/30'
    }
  };
  
  const gradient = `bg-gradient-to-br ${gradients[scene]?.[timeOfDay] || gradients.ocean[timeOfDay]}`;
  gradientCache.set(key, gradient);
  return gradient;
};